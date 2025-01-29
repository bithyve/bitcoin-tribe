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
import { useMutation } from 'react-query';
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
import SecondaryCTA from 'src/components/SecondaryCTA';
import ModalLoading from 'src/components/ModalLoading';
import InsufficiantBalancePopupContainer from 'src/screens/collectiblesCoins/components/InsufficiantBalancePopupContainer';

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
};

const ServiceFee = ({
  feeDetails,
  onPay,
  status,
  onSkip,
  hideModal,
}: ServiceFeeProps) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  if (!feeDetails) {
    return null;
  }

  return (
    <View style={styles.containerFee}>
      <View>
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

        <SecondaryCTA
          title={common.skip}
          disabled={status === 'loading'}
          onPress={() => {
            hideModal();
            setTimeout(() => {
              onSkip();
            }, 400);
          }}
          buttonColor={theme.colors.buy}
          height={hp(18)}
        />

        <View style={styles.primaryCtaStyle}>
          <SwipeToAction
            title={'Swipe to Pay'}
            loadingTitle={'Paying...'}
            onSwipeComplete={onPay}
          />
        </View>
      </View>
    </View>
  );
};

function AddAsset() {
  const navigation = useNavigation();
  const { issueAssetType } = useRoute().params;
  const wallet: Wallet = useWallets({}).wallets[0];
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [visible, setVisible] = useState(false);
  const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
    RealmSchema.RgbWallet,
  );
  const [feeDetails, setFeeDetails] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);

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
      const feeData = getAssetIssuanceFeeMutation.data;
      if (feeData.fee > 0) {
        setFeeDetails(feeData);
        const feesPaid = wallet.specs.transactions.filter(
          tx =>
            tx.transactionKind === TransactionKind.SERVICE_FEE &&
            tx.metadata?.assetId === '',
        );
        if (feesPaid.length > 0) {
          navigateToIssue(true);
        } else {
          setTimeout(() => {
            setShowFeeModal(true);
          }, 300);
          getAssetIssuanceFeeMutation.reset();
        }
      } else {
        navigateToIssue(true);
      }
    } else if (getAssetIssuanceFeeMutation.error) {
      Toast('Failed to fetch asset issuance fee.');
      getAssetIssuanceFeeMutation.reset();
    }
  }, [
    getAssetIssuanceFeeMutation,
    navigation,
    issueAssetType,
    wallet.specs.transactions,
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
      Toast(`Failed to pay service fee: ${payServiceFeeFeeMutation.error}`);
      payServiceFeeFeeMutation.reset();
      setShowFeeModal(false);
    }
  }, [payServiceFeeFeeMutation, navigation, issueAssetType]);

  const canProceed = useMemo(() => {
    return (
      wallet?.specs.balances.confirmed + wallet?.specs.balances.unconfirmed >
        0 || colorable.length > 0
    );
  }, [
    colorable.length,
    wallet?.specs.balances.confirmed,
    wallet?.specs.balances.unconfirmed,
  ]);

  const navigateToIssue = useCallback(
    (addToRegistry: boolean) => {
      setTimeout(() => {
        if (issueAssetType === AssetType.Coin) {
          navigation.replace(NavigationRoutes.ISSUESCREEN, {
            issueAssetType,
            addToRegistry,
          });
        } else {
          navigation.replace(NavigationRoutes.ISSUECOLLECTIBLESCREEN, {
            issueAssetType,
            addToRegistry,
          });
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
          title={'List Your Asset In Registry'}
          subTitle={
            'Do you want to store your Asset on our Tribe RGB Registry? A small platform fee is required. If not, you can skip this step.'
          }
          height={Platform.OS === 'ios' ? '60%' : ''}
          visible={showFeeModal}
          enableCloseIcon={false}
          onDismiss={() => {
            setShowFeeModal(false);
            getAssetIssuanceFeeMutation.reset();
          }}>
          <ServiceFee
            onPay={() => payServiceFeeFeeMutation.mutate({ feeDetails })}
            feeDetails={feeDetails}
            status={payServiceFeeFeeMutation.status}
            onSkip={() => navigateToIssue(false)}
            hideModal={() => {
              setShowFeeModal(false);
              getAssetIssuanceFeeMutation.reset();
            }}
          />
        </ModalContainer>
      </View>

      <View style={styles.container}>
        <SelectOption
          title={
            issueAssetType === AssetType.Coin
              ? 'Issue Coin'
              : 'Issue Collectible'
          }
          backColor={theme.colors.inputBackground}
          style={styles.optionStyle}
          onPress={() => {
            if (!canProceed) {
              setVisible(true);
            } else {
              getAssetIssuanceFeeMutation.mutate();
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
      borderTopWidth: 1,
      paddingTop: hp(15),
    },
    labelWrapper: {
      width: '45%',
    },
    valueWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '55%',
    },
    labelText: {
      color: theme.colors.headingColor,
    },
    primaryCtaStyle: {
      marginVertical: hp(15),
    },
    amtContainer: {
      marginVertical: hp(20),
      padding: hp(15),
      borderRadius: 15,
      alignItems: 'center',
      borderColor: '#787878',
      borderWidth: 1,
      borderStyle: 'dashed',
      flexDirection: 'row',
    },
    loaderStyle: {
      alignSelf: 'center',
      width: hp(150),
      height: hp(150),
      marginVertical: hp(20),
    },
  });

export default AddAsset;
