import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMutation, useQuery } from 'react-query';
import AppHeader from 'src/components/AppHeader';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import ScreenContainer from 'src/components/ScreenContainer';
import SelectOption from 'src/components/SelectOption';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import useWallets from 'src/hooks/useWallets';
import {
  AssetType,
  RgbUnspent,
  RGBWallet,
} from 'src/models/interfaces/RGBWallet';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import Relay from 'src/services/relay';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';
import { AppTheme } from 'src/theme';
import ModalContainer from 'src/components/ModalContainer';
import AppText from 'src/components/AppText';
import SwipeToAction from 'src/components/SwipeToAction';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { TransactionKind } from 'src/services/wallets/enums';
import Toast from 'src/components/Toast';
import ModalLoading from 'src/components/ModalLoading';
import InsufficiantBalancePopupContainer from 'src/screens/collectiblesCoins/components/InsufficiantBalancePopupContainer';
import SkipButton from 'src/components/SkipButton';
import AppType from 'src/models/enums/AppType';
import { TribeApp } from 'src/models/interfaces/TribeApp';

type ServiceFeeProps = {
  feeDetails: {
    address: string;
    fee: string;
    includeTxFee: string;
  };
  onPay: () => void;
  onSkip: () => void;
  hideModal: () => void;
  status: 'error' | 'idle' | 'loading' | 'success';
  disabledCTA?: boolean;
};

export const ServiceFee = ({
  feeDetails,
  onPay,
  status,
  onSkip,
  hideModal,
  disabledCTA,
}: ServiceFeeProps) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;

  if (!feeDetails) {
    return null;
  }

  return (
    <View style={styles.containerFee}>
      <View style={styles.wrapper}>
        <View style={styles.amtContainer}>
          <View style={styles.labelWrapper}>
            <AppText style={styles.labelText}>{'Service Fee'}:</AppText>
          </View>
          <View style={styles.valueWrapper}>
            <AppText style={styles.labelText}>{`${numberWithCommas(
              feeDetails.fee,
            )} sats`}</AppText>
          </View>
        </View>
      </View>
      <View>
        <View style={styles.primaryCtaStyle}>
          <SwipeToAction
            title={assets.swipeToPay}
            loadingTitle={assets.payInprocess}
            onSwipeComplete={onPay}
            backColor={theme.colors.swipeToActionThumbColor}
          />
        </View>
        <SkipButton
          disabled={disabledCTA}
          onPress={() => {
            hideModal();
            setTimeout(() => {
              onSkip();
            }, 400);
          }}
          title={assets.skipForNow}
        />
      </View>
    </View>
  );
};

function AddAsset() {
  const navigation = useNavigation();
  const issueAssetType = useRoute().params?.issueAssetType;
  const wallet: Wallet = useWallets({}).wallets[0];
  const { translations } = useContext(LocalizationContext);
  const { home, assets } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [visible, setVisible] = useState(false);
  const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
    RealmSchema.RgbWallet,
  );
  const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
  const [feeDetails, setFeeDetails] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [disabledCTA, setDisabledCTA] = useState(false);

  const unspent: RgbUnspent[] = rgbWallet.utxos.map(utxoStr =>
    JSON.parse(utxoStr),
  );
  const colorable = unspent.filter(
    utxo => utxo.utxo.colorable === true && utxo.rgbAllocations?.length === 0,
  );

  const getAssetIssuanceFeeMutation = useMutation(Relay.getAssetIssuanceFee);
  const payServiceFeeFeeMutation = useMutation(ApiHandler.payServiceFee);

  useEffect(() => {
    if (getAssetIssuanceFeeMutation.isSuccess) {
      if (app.appType === AppType.NODE_CONNECT) {
        navigateToIssue(false);
        return;
      }
      const feeData = getAssetIssuanceFeeMutation.data;
      if (feeData.fee > 0) {
        setFeeDetails(feeData);
        const feesPaid = wallet?.specs.transactions.filter(
          tx =>
            tx.transactionKind === TransactionKind.SERVICE_FEE &&
            tx.metadata?.assetId === '',
        );
        if (feesPaid?.length > 0) {
          navigateToIssue(false);
        } else {
          setTimeout(() => {
            setShowFeeModal(true);
          }, 500);
          getAssetIssuanceFeeMutation.reset();
        }
      } else {
        navigateToIssue(false);
        setDisabledCTA(false);
      }
    } else if (getAssetIssuanceFeeMutation.error) {
      Toast(assets.failToFetchIssueFee, true);
      getAssetIssuanceFeeMutation.reset();
      setDisabledCTA(false);
    }
  }, [
    getAssetIssuanceFeeMutation.isSuccess,
    getAssetIssuanceFeeMutation.data,
    getAssetIssuanceFeeMutation.error,
    navigation,
    issueAssetType,
  ]);

  useEffect(() => {
    if (payServiceFeeFeeMutation.isSuccess) {
      getAssetIssuanceFeeMutation.reset();
      payServiceFeeFeeMutation.reset();
      setShowFeeModal(false);
      setTimeout(() => {
        navigateToIssue(true);
      }, 400);
    } else if (payServiceFeeFeeMutation.error) {
      const errorMessage =
        payServiceFeeFeeMutation.error?.message ||
        payServiceFeeFeeMutation.error?.toString() ||
        'An unexpected error occurred';
      Toast(assets.payServiceFeeFundError, true);
      payServiceFeeFeeMutation.reset();
      setShowFeeModal(false);
      setDisabledCTA(false);
    }
  }, [payServiceFeeFeeMutation, navigation, issueAssetType]);

  const canProceed = useMemo(() => {
    if (app.appType === AppType.NODE_CONNECT) {
      return (
        rgbWallet?.nodeBtcBalance?.vanilla?.spendable +
          rgbWallet?.nodeBtcBalance?.vanilla?.future >
        0
      );
    }
    return (
      wallet?.specs.balances.confirmed + wallet?.specs.balances.unconfirmed >
        0 || colorable.length > 0
    );
  }, [
    colorable.length,
    wallet?.specs.balances.confirmed,
    wallet?.specs.balances.unconfirmed,
    rgbWallet?.nodeBtcBalance?.vanilla?.spendable,
  ]);

  const navigateToIssue = useCallback(
    (addToRegistry: boolean) => {
      setTimeout(() => {
        if (issueAssetType === AssetType.Coin) {
          navigation.replace(NavigationRoutes.ISSUESCREEN, {
            issueAssetType,
            addToRegistry,
          });
          setDisabledCTA(false);
        } else {
          navigation.replace(NavigationRoutes.ISSUECOLLECTIBLESCREEN, {
            issueAssetType,
            addToRegistry,
          });
          setDisabledCTA(false);
        }
      }, 500);
    },
    [issueAssetType, navigation],
  );

  return (
    <ScreenContainer>
      <AppHeader title={home.createAssets} subTitle={home.addAssetSubTitle} />
      <ModalLoading visible={getAssetIssuanceFeeMutation.isLoading} />
      <View>
        <ModalContainer
          title={assets.listYourAssetInRegTitle}
          subTitle={assets.listYourAssetInRegSubTitle}
          visible={showFeeModal}
          enableCloseIcon={false}
          onDismiss={() => {
            if (payServiceFeeFeeMutation.isLoading) return;
            setShowFeeModal(false);
            getAssetIssuanceFeeMutation.reset();
          }}>
          <ServiceFee
            onPay={async () => {
              setDisabledCTA(true);
              await ApiHandler.refreshWallets({ wallets: [wallet] });
              payServiceFeeFeeMutation.mutate({ feeDetails });
            }}
            feeDetails={feeDetails}
            status={payServiceFeeFeeMutation.status}
            onSkip={() => navigateToIssue(false)}
            hideModal={() => {
              setShowFeeModal(false);
              getAssetIssuanceFeeMutation.reset();
            }}
            disabledCTA={disabledCTA}
          />
        </ModalContainer>
      </View>

      <View style={styles.container}>
        <SelectOption
          title={
            issueAssetType === AssetType.Coin
              ? assets.issueNewCoin
              : assets.issueCollectibles
          }
          backColor={theme.colors.inputBackground}
          style={styles.optionStyle}
          onPress={() => {
            if (!canProceed) {
              setVisible(true);
            } else {
              navigateToIssue(false);
            }
          }}
          testID="issue_new"
        />
        <SelectOption
          title={home.addAssets}
          backColor={theme.colors.inputBackground}
          style={styles.optionStyle}
          onPress={() => {
            if (!canProceed) {
              setVisible(true);
            } else {
              navigation.replace(NavigationRoutes.ENTERINVOICEDETAILS, {
                refresh: true,
              });
            }
          }}
          testID="receive"
        />
      </View>

      <View>
        <ResponsePopupContainer
          visible={visible}
          enableClose={true}
          onDismiss={() => setVisible(false)}
          backColor={theme.colors.cardGradient1}
          borderColor={theme.colors.borderColor}>
          <InsufficiantBalancePopupContainer
            primaryOnPress={() => {
              setVisible(false);
              setTimeout(() => {
                navigation.replace(NavigationRoutes.RECEIVESCREEN);
              }, 500);
            }}
            secondaryOnPress={() => setVisible(false)}
          />
        </ResponsePopupContainer>
      </View>
    </ScreenContainer>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: hp(20),
    },
    optionStyle: {
      marginVertical: hp(5),
      paddingHorizontal: 20,
    },
    containerFee: {
      borderTopColor: theme.colors.borderColor,
      borderTopWidth: 2,
      paddingTop: hp(5),
    },
    wrapper: {
      // height: '50%',
    },
    labelWrapper: {
      width: '45%',
    },
    valueWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: '55%',
    },
    labelText: {
      color: theme.colors.headingColor,
    },
    primaryCtaStyle: {
      marginVertical: hp(15),
    },
    amtContainer: {
      marginVertical: Platform.OS === 'ios' ? hp(20) : hp(45),
      padding: hp(15),
      borderRadius: 15,
      alignItems: 'center',
      borderColor: theme.colors.serviceFeeBorder,
      borderWidth: 1,
      borderStyle: 'dashed',
      flexDirection: 'row',
      width: '80%',
      alignSelf: 'center',
    },
    loaderStyle: {
      alignSelf: 'center',
      width: hp(150),
      height: hp(150),
      marginVertical: hp(20),
    },
  });

export default AddAsset;
