import React, { useContext, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import moment from 'moment';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from 'react-query';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import ScreenContainer from 'src/components/ScreenContainer';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppHeader from 'src/components/AppHeader';
import AppText from 'src/components/AppText';
import AssetRegisterIllustration from 'src/assets/images/assetRegisterIllustration.svg';
import SkipButton from 'src/components/SkipButton';
import SwipeToAction from 'src/components/SwipeToAction';
import Relay from 'src/services/relay';
import { ApiHandler } from 'src/services/handler/apiHandler';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import Toast from 'src/components/Toast';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Asset, AssetType } from 'src/models/interfaces/RGBWallet';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import { TransactionKind } from 'src/services/wallets/enums';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { AppContext } from 'src/contexts/AppContext';
import Fonts from 'src/constants/Fonts';

function AssetRegistryScreen() {
  const navigation = useNavigation();
  const { assetId, askVerify, issueType } = useRoute().params;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;
  const { setHasIssuedAsset } = useContext(AppContext);
  const styles = getStyles(theme);
  const wallet: Wallet = useWallets({}).wallets[0];
  const getAssetIssuanceFeeMutation = useMutation(Relay.getAssetIssuanceFee);
  const payServiceFeeFeeMutation = useMutation(ApiHandler.payServiceFee);
  const [feeDetails, setFeeDetails] = useState(null);
  const [disabledCTA, setDisabledCTA] = useState(false);

  const schema = () => {
    switch (issueType) {
      case AssetType.Coin:
        return RealmSchema.Coin;
      case AssetType.Collectible:
        return RealmSchema.Collectible;
      case AssetType.UDA:
        return RealmSchema.UniqueDigitalAsset;
      default:
        return null;
    }
  };

  const routeMap = (askVerify: boolean) => {
    switch (issueType) {
      case AssetType.Coin:
        navigation.replace(NavigationRoutes.COINDETAILS, {
          assetId,
          askReview: true,
          askVerify,
        });
        break;
      case AssetType.Collectible:
        navigation.replace(NavigationRoutes.COLLECTIBLEDETAILS, {
          assetId,
          askReview: true,
          askVerify,
        });
        break;
      case AssetType.UDA:
        navigation.replace(NavigationRoutes.UDADETAILS, {
          assetId,
          askReview: true,
          askVerify,
        });
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    getAssetIssuanceFeeMutation.mutate();
  }, [assetId]);

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
          registerAsset();
        } else {
          getAssetIssuanceFeeMutation.reset();
        }
      } else {
        registerAsset();
      }
    } else if (getAssetIssuanceFeeMutation.error) {
      Toast(assets.failToFetchIssueFee, true);
      getAssetIssuanceFeeMutation.reset();
    }
  }, [
    getAssetIssuanceFeeMutation.isSuccess,
    getAssetIssuanceFeeMutation.data,
    getAssetIssuanceFeeMutation.error,
  ]);

  useEffect(() => {
    if (payServiceFeeFeeMutation.isSuccess) {
      getAssetIssuanceFeeMutation.reset();
      payServiceFeeFeeMutation.reset();
      setTimeout(() => {
        registerAsset();
      }, 400);
    } else if (payServiceFeeFeeMutation.error) {
      const errorMessage =
        payServiceFeeFeeMutation.error?.message ||
        payServiceFeeFeeMutation.error?.toString() ||
        'An unexpected error occurred';
      if (errorMessage === 'Insufficient balance') {
        Toast(assets.payServiceFeeFundError, true);
        navigation.goBack();
      }
      payServiceFeeFeeMutation.reset();
    }
  }, [payServiceFeeFeeMutation]);

  const registerAsset = React.useCallback(async () => {
    try {
      const asset = dbManager.getObjectByPrimaryId(
        schema(),
        'assetId',
        assetId,
      ) as unknown as Asset;
      const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
      const { status } = await Relay.registerAsset(app.id, asset);
      if (status) {
        const askVerify = true;
        setTimeout(() => routeMap(askVerify), 1000);
        setDisabledCTA(false);
        const tx = wallet.specs.transactions.find(
          tx =>
            tx.transactionKind === TransactionKind.SERVICE_FEE &&
            tx.metadata?.assetId === '',
        );
        if (tx) {
          ApiHandler.updateTransaction({
            txid: tx.txid,
            updateProps: {
              metadata: {
                assetId: assetId,
                note: `Issued ${asset.name} on ${moment().format(
                  'DD MMM YY  •  hh:mm A',
                )}`,
              },
            },
          });
        }
      }
    } catch (error) {
      setDisabledCTA(false);
      Toast(`${error}`, true);
      console.log(error);
    }
  }, [assetId, schema]);

  return (
    <ScreenContainer style={styles.container}>
      <AppHeader title={common.registry} style={styles.headerWrapper} />
      <View style={styles.wrapper}>
        <Text style={styles.subTitleText}>
          {assets.assetRegistrySubTitle} {assets.assetRegistrySubTitle2}{' '}
          <Text style={styles.subTitleText}>{`${numberWithCommas(
            feeDetails?.fee,
          )} sats`}</Text>{' '}
          {assets.assetRegistrySubTitle3}
        </Text>
      </View>
      <View style={styles.illustrationWrapper}>
        <AssetRegisterIllustration />
      </View>
      <View style={styles.containerFee}>
        <View style={styles.feeWrapper}>
          <View style={styles.amtContainer}>
            <View style={styles.labelWrapper}>
              <AppText style={styles.labelText}>{'Service Fee'}:</AppText>
            </View>
            <View style={styles.valueWrapper}>
              <AppText style={styles.labelText}>{`${numberWithCommas(
                feeDetails?.fee,
              )} sats`}</AppText>
            </View>
          </View>
        </View>
        <View style={styles.primaryCtaStyle}>
          <SwipeToAction
            title={assets.swipeToPay}
            loadingTitle={assets.payInprocess}
            onSwipeComplete={async () => {
              setDisabledCTA(true);
              await ApiHandler.refreshWallets({ wallets: [wallet] });
              payServiceFeeFeeMutation.mutate({ feeDetails });
            }}
            backColor={theme.colors.swipeToActionThumbColor}
          />
        </View>
        <View style={styles.skipWrapper}>
          <SkipButton
            disabled={disabledCTA}
            onPress={() => {
              setHasIssuedAsset(true);
              setTimeout(() => routeMap(false), 500);
            }}
            title={assets.skipForNow}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      paddingHorizontal: 0,
    },
    headerWrapper: {
      paddingHorizontal: hp(20),
    },
    wrapper: {
      paddingHorizontal: hp(20),
      paddingTop: hp(10),
    },
    feeWrapper: {
      marginVertical: hp(12),
    },
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'left',
      marginBottom: hp(3),
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'left',
      fontSize: 16,
      fontWeight: '400',
      fontFamily: Fonts.LufgaRegular,
    },
    illustrationWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      height: Platform.OS === 'ios' ? '38%' : '33%',
      paddingTop: Platform.OS === 'ios' ? hp(0) : hp(20),
    },
    containerFee: {
      paddingHorizontal: hp(25),
      height: '50%',
      width: '100%',
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
      marginVertical: hp(20),
    },
    skipWrapper: {
      marginVertical: hp(20),
    },
    amtContainer: {
      marginVertical: Platform.OS === 'ios' ? hp(20) : hp(35),
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
  });
export default gestureHandlerRootHOC(AssetRegistryScreen);
