import { useNavigation } from '@react-navigation/native';
import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import useWallets from 'src/hooks/useWallets';
import {
  AssetType,
  RgbUnspent,
  RGBWallet,
} from 'src/models/interfaces/RGBWallet';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';
import { AppTheme } from 'src/theme';
import InsufficiantBalancePopupContainer from 'src/screens/collectiblesCoins/components/InsufficiantBalancePopupContainer';
import AppType from 'src/models/enums/AppType';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import RibbonCard from 'src/components/RibbonCardCard';
import AppText from 'src/components/AppText';
import SwipeToAction from 'src/components/SwipeToAction';
import SkipButton from 'src/components/SkipButton';

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
            <AppText style={styles.labelText}>{'Platform Fee'}:</AppText>
          </View>
          <View style={styles.valueWrapper}>
            <AppText style={styles.labelText}>{`${feeDetails.fee} sats`}</AppText>
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
            loaderTextColor={theme.colors.primaryCTAText}
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
  const unspent: RgbUnspent[] = rgbWallet.utxos.map(utxoStr =>
    JSON.parse(utxoStr),
  );
  const colorable = unspent.filter(
    utxo => utxo.utxo.colorable === true && utxo.rgbAllocations?.length === 0,
  );
  

  const canProceed = useMemo(() => {
    if (
      app.appType === AppType.NODE_CONNECT ||
      app.appType === AppType.SUPPORTED_RLN
    ) {
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
    (addToRegistry: boolean, issueAssetType) => {
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
    [navigation],
  );

  return (
    <ScreenContainer>
      <AppHeader title={home.createAssets} subTitle={home.addAssetSubTitle} />

      <View style={styles.container}>
        <RibbonCard
          title={assets.issueNewCoin}
          subTitle={assets.issueNewCoinSubtitle}
          backColor={theme.colors.inputBackground}
          style={styles.optionStyle}
          onPress={() => {
            if (!canProceed) {
              setVisible(true);
            } else {
              navigateToIssue(false, AssetType.Coin);
            }
          }}
        />

        <RibbonCard
          title={assets.issueCollectibles}
          subTitle={assets.issueCollectiblesSubtitle}
          backColor={theme.colors.inputBackground}
          style={styles.optionStyle}
          onPress={() => {
            if (!canProceed) {
              setVisible(true);
            } else {
              navigateToIssue(false, AssetType.Collectible);
            }
          }}
        />
        <RibbonCard
          title={home.addAssets}
          subTitle={home.receiveAssetsSubtitle}
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
      gap: hp(12),
    },
    optionStyle: {
      paddingHorizontal: 20,
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
    containerFee: {
      borderTopColor: theme.colors.borderColor,
      borderTopWidth: 2,
      paddingTop: hp(5),
    },
    wrapper: {
      // height: '50%',
    },
  });

export default AddAsset;
