import React, { useState, useContext, useCallback } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { useQuery } from '@realm/react';
import { useTheme } from 'react-native-paper';
import { Code } from 'react-native-vision-camera';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from 'src/components/OptionCard';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import QRScanner from 'src/components/QRScanner';
import { AppTheme } from 'src/theme';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import ModalContainer from 'src/components/ModalContainer';
import SendEnterAddress from './components/SendEnterAddress';
import { PaymentInfoKind } from 'src/services/wallets/enums';
import Toast from 'src/components/Toast';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/config';
import { hp, wp } from 'src/constants/responsive';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { RealmSchema } from 'src/storage/enum';
import { Asset, Coin, Collectible } from 'src/models/interfaces/RGBWallet';
import ModalLoading from 'src/components/ModalLoading';
import useWallets from 'src/hooks/useWallets';
import { CommunityType, deeplinkType } from 'src/models/interfaces/Community';
import Relay from 'src/services/relay';
import AppText from 'src/components/AppText';
import Modal from 'react-native-modal';
import AddToWalletIcon from 'src/assets/images/add-to-wallet.svg';
import AddToWalletIconLight from 'src/assets/images/add-to-wallet-light.svg';
import Buttons from 'src/components/Buttons';
import AssetIcon from 'src/components/AssetIcon';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';
import { numberWithCommas } from 'src/utils/numberWithCommas';

function SendScreen({ route, navigation }) {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen, assets } = translations;
  const styles = getStyles(theme);
  const [visible, setVisible] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [validatingInvoiceErrorMsg, setValidatingInvoiceErrorMsg] =
    useState('');
  const [isScanning, setIsScanning] = useState(true);
  const wallet = useWallets({}).wallets[0];
  const { receiveData, title, subTitle } = route.params;
  const app: TribeApp = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const coins = useQuery<Coin[]>(RealmSchema.Coin);
  const collectibles = useQuery<Collectible[]>(RealmSchema.Collectible);
  const allAssets: Asset[] = [...coins, ...collectibles];
  const [addAssetModal, setAddAssetModal] = useState(false);
  const [assetData, setAssetData] = useState<Asset | null>(null);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const navigateWithDelay = (callback: () => void) => {
    setVisible(false);
    setTimeout(() => {
      callback();
    }, 2000);
  };

  const formatInvoiceErrorMessage = (error: any): string => {
    const rawMessage = error?.message || '';
    if (rawMessage.includes('InvalidInvoice')) {
      if (rawMessage.includes('invalid query parameter')) {
        return sendScreen.invoiceInvalidContainErrMsg;
      }
      return sendScreen.invoiceFormatErrMsg;
    }
    if (rawMessage.includes('RgbLibError')) {
      return sendScreen.failedInvoiceProcessErrMsg;
    }
    return 'An unknown error occurred while decoding the invoice.';
  };

  const handlePaymentInfo = useCallback(
    async (
      input: { codes?: Code[]; paymentInfo?: string },
      triggerSource: 'scan' | 'proceed',
    ) => {
      setIsScanning(false);
      setVisibleModal(true);
      const { codes, paymentInfo } = input;
      const value = paymentInfo || codes?.[0]?.value;

      if (!value) {
        setIsScanning(true);
        setVisibleModal(false);
        return;
      }
      if (
        value.startsWith(config.REGISTRY_URL) ||
        (value.includes('rgb:') && value.length < 60)
      ) {
        setVisible(false);
        setIsScanning(false);
        const parts = value.split('/').filter(Boolean);
        const assetId = parts[parts.length - 1] || null;
        if (assetId) {
          if (allAssets.find(item => item.assetId === assetId)) {
            setVisibleModal(false);
            setIsScanning(true);
            Toast('Asset already exists in your wallet', true);
            return;
          }
          const res = await Relay.lookupAsset(assetId);
          setVisibleModal(false);
          if (res.status) {
            setAssetData(res.asset);
            navigateWithDelay(() => {
              setAddAssetModal(true);
            });
          } else {
            Toast(res.error, true);
          }
          return;
        }
      }

      if (value.startsWith('tribe://')) {
        setIsScanning(true);
        setVisibleModal(false);
        navigateWithDelay(() => {
          const urlParts = value.split('/');
          const path = urlParts[2];
          if (path === deeplinkType.Contact) {
            const contactKey = urlParts[3];
            const publicKey = urlParts[4];
            navigation.navigate(NavigationRoutes.COMMUNITY, {
              contactKey,
              type: CommunityType.Peer,
              publicKey,
            });
          } else if (path === deeplinkType.Group) {
            const groupKey = urlParts[3];
            navigation.navigate(NavigationRoutes.COMMUNITY, {
              groupKey,
              type: CommunityType.Group,
            });
          }
        });
        return;
      }

      if (value.startsWith('rgb:')) {
        try {
          const res = await ApiHandler.decodeInvoice(value);
          if (res.network.toUpperCase() !== config.NETWORK_TYPE) {
            setVisible(false);
            setIsScanning(true);
            setVisibleModal(false);
            Toast('This invoice is not valid for the current network', true);
            return;
          }
          if (res.assetId) {
            const assetData = allAssets.find(
              item => item.assetId === res.assetId,
            );
            if (!assetData) {
              setIsScanning(true);
              setVisibleModal(false);
              if (triggerSource === 'scan') {
                Toast(assets.assetNotFoundMsg, true);
              } else {
                setValidatingInvoiceErrorMsg(assets.assetNotFoundMsg);
              }
            } else {
              setVisibleModal(false);
              navigateWithDelay(() => {
                navigation.replace(NavigationRoutes.SENDASSET, {
                  assetId: res.assetId,
                  wallet: wallet,
                  rgbInvoice: value,
                  amount: res?.assignment?.amount.toString(),
                });
              });
            }
          } else {
            setVisibleModal(false);
            navigateWithDelay(() => {
              navigation.replace(NavigationRoutes.SELECTASSETTOSEND, {
                wallet,
                rgbInvoice: value,
                assetID: '',
                amount: '',
              });
            });
          }
          return;
        } catch (error) {
          const errorMsg = formatInvoiceErrorMessage(error);
          setIsScanning(true);
          setVisibleModal(false);
          setValidatingInvoiceErrorMsg(errorMsg);
          console.log('error send', error);
          return;
        }
      }
      if (value.startsWith('lnbc')) {
        setVisibleModal(false);
        setVisible(false);
        navigateWithDelay(() => {
          navigation.replace(NavigationRoutes.LIGHTNINGSEND, {
            invoice: value,
          });
        });
        return;
      }
      const network = WalletUtilities.getNetworkByType(
        paymentInfo ? app.networkType : config.NETWORK_TYPE,
      );
      let {
        type: paymentInfoKind,
        address,
        amount,
      } = WalletUtilities.addressDiff(value, network);

      if (amount) {
        amount = Math.trunc(amount * 1e8); // Convert from bitcoins to sats
      }

      switch (paymentInfoKind) {
        case PaymentInfoKind.ADDRESS:
          setIsScanning(true);
          setVisibleModal(false);
          navigateWithDelay(() => {
            navigation.navigate(NavigationRoutes.SENDTO, { wallet, address });
          });
          break;
        case PaymentInfoKind.PAYMENT_URI:
          setIsScanning(true);
          setVisibleModal(false);
          navigateWithDelay(() => {
            navigation.navigate(NavigationRoutes.SENDTO, {
              wallet,
              address,
              paymentURIAmount: amount,
            });
          });
          break;
        case PaymentInfoKind.RLN_INVOICE:
          setIsScanning(true);
          setVisibleModal(false);
          navigateWithDelay(() => {
            navigation.replace(NavigationRoutes.LIGHTNINGSEND, {
              invoice: value,
            });
          });
          break;
        default:
          setIsScanning(true);
          setVisibleModal(false);
          if (triggerSource === 'scan') {
            Toast(sendScreen.invalidBtcAndRgbInput, true);
          } else {
            setValidatingInvoiceErrorMsg(sendScreen.invalidBtcAndRgbInput);
          }
      }
    },
    [wallet, navigation],
  );

  const onCodeScanned = async (codes: Code[]) => {
    await handlePaymentInfo({ codes }, 'scan');
  };
  const onProceed = async (paymentInfo: string) => {
    await handlePaymentInfo({ paymentInfo }, 'proceed');
  };

  return (
    <ScreenContainer>
      <AppHeader title={title} subTitle={subTitle} enableBack={true} />
      <View>
        <ModalLoading visible={visibleModal} />
      </View>
      <View style={styles.scannerWrapper}>
        {!visible && (
          <QRScanner onCodeScanned={onCodeScanned} isScanning={isScanning} />
        )}
      </View>
      <OptionCard
        title={sendScreen.optionCardTitle}
        // subTitle={sendScreen.optionCardSubTitle}
        onPress={() => {
          receiveData === 'send'
            ? setVisible(true)
            : navigation.navigate(NavigationRoutes.CONNECTNODEMANUALLY);
        }}
      />
      <ModalContainer
        title={sendScreen.enterSendAddressInvoice}
        subTitle={sendScreen.enterSendAdrsInvoiceSubTitle}
        visible={visible}
        enableCloseIcon={false}
        height={Platform.OS == 'ios' && '85%'}
        onDismiss={() => {
          setValidatingInvoiceErrorMsg('');
          setVisible(false);
        }}>
        <SendEnterAddress
          onDismiss={() => {
            setValidatingInvoiceErrorMsg('');
            setVisible(false);
          }}
          onProceed={address => onProceed(address)}
          errorMessage={validatingInvoiceErrorMsg}
        />
      </ModalContainer>

      <Modal
        isVisible={addAssetModal}
        onDismiss={() => {
          setAddAssetModal(false);
          setIsScanning(true);
        }}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}>
        <View style={styles.addAssetModalContent}>
          <AppText variant="heading2" style={styles.addAssetModalTitle}>
            Do you want to add this asset to your wallet?
          </AppText>
          <AppText variant="body2" style={styles.addAssetModalSubTitle}>
            Once added, you can view and manage this asset in your wallet.
          </AppText>
          <View style={styles.line} />
          <View style={styles.addAssetModalTitleContainer}>
            <View>
              <View style={styles.row}>
                <AppText>{'Name: '}</AppText>
                <AppText>{assetData?.name}</AppText>
              </View>

              {assetData?.ticker&& (
                <View style={styles.row}>
                  <AppText>{'Ticker: '}</AppText>
                  <AppText>{assetData?.ticker}</AppText>
                </View>
              )}

              <View style={styles.row}>
                <AppText>{'Schema: '}</AppText>
                <AppText>{assetData?.metaData.assetSchema}</AppText>
              </View>

              <View style={styles.row}>
                <AppText>{'Issued Supply: '}</AppText>
                <AppText>
                  {numberWithCommas(
                    Number(assetData?.issuedSupply) /
                      10 ** assetData?.precision,
                  )}
                </AppText>
              </View>
            </View>
            <View>
              {(assetData?.iconUrl || assetData?.media?.thumbnail) ? (
                <Image
                  source={{
                    uri: assetData?.iconUrl || assetData?.media?.thumbnail,
                  }}
                  style={styles.imageStyle}
                />
              ) : (
                <AssetIcon
                  assetID={assetData?.assetId}
                  size={65}
                  style={styles.assetIcon}
                />
              )}
            </View>
          </View>

          <View style={styles.addAssetModalIconContainer}>
            {isThemeDark ? <AddToWalletIcon /> : <AddToWalletIconLight />}
          </View>

          <Buttons
            primaryTitle={'Add To Wallet'}
            primaryOnPress={() => {
              ApiHandler.addAssetToWallet({ asset: assetData });
              setAddAssetModal(false);
              Toast('Asset added to wallet', false);
            }}
            secondaryTitle={'Cancel'}
            secondaryOnPress={() => setAddAssetModal(false)}
            height={hp(14)}
            width={wp(130)}
            secondaryCTAWidth={wp(130)}
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scannerWrapper: {
      flex: 1,
      marginTop: hp(20),
    },
    addAssetModalContent: {
      backgroundColor: theme.colors.modalBackColor,
      padding: wp(20),
      borderRadius: hp(30),
      marginHorizontal: 0,
      marginVertical: hp(10),
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    addAssetModalTitle: {
      textAlign: 'left',
    },
    addAssetModalSubTitle: {
      textAlign: 'left',
      marginTop: hp(10),
      color: '#787878',
    },
    line: {
      width: '100%',
      height: 1,
      backgroundColor: theme.colors.borderColor,
      marginVertical: hp(10),
    },
    addAssetModalTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(4),
    },
    addAssetModalIconContainer: {
      marginVertical: hp(25),
      alignItems: 'center',
      justifyContent: 'center',
    },
    assetIcon: {
      marginRight: wp(10),
    },
    imageStyle: {
      width: 65,
      height: 65,
      borderRadius: 10,
      marginRight: wp(10),
    },
  });
export default SendScreen;
