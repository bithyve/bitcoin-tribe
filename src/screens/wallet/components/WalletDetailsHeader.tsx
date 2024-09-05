import React, { useContext, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { CommonActions, useNavigation } from '@react-navigation/native';

import AppText from 'src/components/AppText';
import IconBitcoin from 'src/assets/images/icon_btc3.svg';
import IconBitcoin1 from 'src/assets/images/icon_btc2.svg';
import TransactionButtons from './TransactionButtons';
import WalletSectionHeader from './WalletSectionHeader';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletOperations from 'src/services/wallets/operations';
import useBalance from 'src/hooks/useBalance';
import { useMMKVString } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';
import { RealmSchema } from 'src/storage/enum';
import { useQuery } from '@realm/react';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

type walletDetailsHeaderProps = {
  profile: string;
  username: string;
  wallet: Wallet;
  onPressSetting?: () => void;
  onPressBuy: () => void;
};
function WalletDetailsHeader(props: walletDetailsHeaderProps) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const {
    receciveScreen,
    common,
    sendScreen,
    home,
    wallet: walletTranslations,
  } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { profile, username, wallet, onPressSetting, onPressBuy } = props;
  const { getBalance, getCurrencyIcon } = useBalance();
  const [currentCurrencyMode, setCurrencyMode] = useMMKVString(
    Keys.CURRENCY_MODE,
  );
  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;
  const {
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = wallet;
  const { changeAddress: receivingAddress } =
    WalletOperations.getNextFreeChangeAddress(wallet);
  const UnspentUTXOData = useQuery(RealmSchema.UnspentRootObjectSchema).map(
    getJSONFromRealmObject,
  );

  const totalBtcAmount = useMemo(() => {
    return UnspentUTXOData.reduce((total, item) => {
      // Check if utxo exists and if btcAmount is present
      return (
        total + (item.utxo && item.utxo.btcAmount ? item.utxo.btcAmount : 0)
      );
    }, 0);
  }, [UnspentUTXOData]);

  const toggleDisplayMode = () => {
    if (!initialCurrencyMode || initialCurrencyMode === CurrencyKind.SATS) {
      setCurrencyMode(CurrencyKind.BITCOIN);
    } else if (initialCurrencyMode === CurrencyKind.BITCOIN) {
      setCurrencyMode(CurrencyKind.FIAT);
    } else {
      setCurrencyMode(CurrencyKind.SATS);
    }
  };

  return (
    <View style={styles.container}>
      <WalletSectionHeader profile={profile} onPress={onPressSetting} />
      <AppText variant="body1" style={styles.usernameText}>
        {username}
      </AppText>
      <View>
        <AppText variant="body2" style={styles.totalBalText}>
          {home.totalBalance}
        </AppText>
      </View>
      <AppTouchable
        style={styles.balanceWrapper}
        onPress={() => toggleDisplayMode()}>
        {initialCurrencyMode !== CurrencyKind.SATS &&
          getCurrencyIcon(IconBitcoin, 'dark', 30)}
        <AppText variant="walletBalance" style={styles.balanceText}>
          &nbsp;{getBalance(confirmed + unconfirmed)}
        </AppText>
        {initialCurrencyMode === CurrencyKind.SATS && (
          <AppText variant="caption" style={styles.satsText}>
            sats
          </AppText>
        )}
      </AppTouchable>
      <GradientView
        style={styles.rgbBalanceWrapper}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <AppText variant="body1" style={styles.rgbAssetTitleText}>
          {walletTranslations.rgbAssets}
        </AppText>
        <View style={styles.rgbAssetAmountWrapper}>
          {initialCurrencyMode !== CurrencyKind.SATS &&
            getCurrencyIcon(IconBitcoin1, 'dark', 15)}
          <AppText variant="body1" style={styles.rgbAssetAmountText}>
            &nbsp;{getBalance(totalBtcAmount)}
          </AppText>
          {initialCurrencyMode === CurrencyKind.SATS && (
            <AppText variant="caption" style={styles.rgbSatsText}>
              sats
            </AppText>
          )}
        </View>
      </GradientView>
      <TransactionButtons
        onPressSend={() =>
          navigation.dispatch(
            CommonActions.navigate(NavigationRoutes.SENDSCREEN, {
              receiveData: 'send',
              title: common.send,
              subTitle: sendScreen.headerSubTitle,
              wallet: wallet,
            }),
          )
        }
        // onPressBuy={onPressBuy}
        onPressRecieve={() =>
          navigation.dispatch(
            CommonActions.navigate(NavigationRoutes.RECEIVESCREEN, {
              receivingAddress,
              title: common.receive,
              subTitle: receciveScreen.headerSubTitle,
            }),
          )
        }
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      width: '100%',
      paddingBottom: 10,
    },
    usernameText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
      marginVertical: 10,
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(10),
    },
    balanceText: {
      color: theme.colors.headingColor,
    },
    satsText: {
      color: theme.colors.headingColor,
      marginTop: hp(10),
      marginLeft: hp(5),
    },
    totalBalText: {
      color: theme.colors.secondaryHeadingColor,
      fontWeight: '400',
    },
    rgbBalanceWrapper: {
      flexDirection: 'row',
      padding: hp(10),
      marginBottom: hp(15),
      borderRadius: 10,
      borderColor: theme.colors.borderColor,
      borderWidth: 0.5,
    },
    rgbAssetAmountWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rgbSatsText: {
      color: theme.colors.headingColor,
      marginLeft: hp(5),
    },
    rgbAssetTitleText: {
      color: theme.colors.secondaryHeadingColor,
      marginRight: hp(10),
    },
    rgbAssetAmountText: {
      color: theme.colors.headingColor,
    },
  });
export default WalletDetailsHeader;
