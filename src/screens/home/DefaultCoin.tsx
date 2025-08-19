import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useMemo, useState } from 'react';
import { Asset, AssetVisibility, Coin } from 'src/models/interfaces/RGBWallet';
import AppText from 'src/components/AppText';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import { Keys } from 'src/storage';
import { useMMKVBoolean } from 'react-native-mmkv';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AssetIcon from 'src/components/AssetIcon';
import TransactionButtons from '../wallet/components/TransactionButtons';
import { formatLargeNumber } from 'src/utils/numberWithCommas';
import AppTouchable from 'src/components/AppTouchable';
import { useNavigation } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppType from 'src/models/enums/AppType';
import { AppContext } from 'src/contexts/AppContext';
import { RealmSchema } from 'src/storage/enum';
import TransactionsList from '../assets/TransactionsList';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import IconBitcoin from 'src/assets/images/ic_btc.svg';
import IconOtherAssets from 'src/assets/images/ic_otherassets.svg';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import useRgbWallets from 'src/hooks/useRgbWallets';
import useBalance from 'src/hooks/useBalance';
import { useQuery } from '@realm/react';
import GradientBorderAnimated from './GradientBorderAnimated';
import RefreshControlView from 'src/components/RefreshControlView';

const getStyles = (theme: AppTheme, isThemeDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      margin: wp(10),
      backgroundColor: theme.colors.primaryBackground,
    },
    largeHeaderContainer: {
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: hp(20),
      backgroundColor: isThemeDark ? '#111' : '#fff',
      padding: hp(20),
      marginBottom: hp(10),
    },
    row: {
      flexDirection: 'row',
      marginBottom: hp(20),
    },
    coinNameContainer: {
      flex: 1,
    },
    totalBalance: {
      marginTop: hp(10),
      color: theme.colors.headingColor,
      fontSize: 40,
    },
    totalBalanceLabel: {
      color: theme.colors.secondaryHeadingColor,
    },
    campaignContainer: {
      backgroundColor: isThemeDark ? '#24262B' : '#E9EEEF',
      borderTopLeftRadius: hp(20),
      borderTopRightRadius: hp(20),
      zIndex: -1000,
    },
    transactionContainer: {
      height: windowHeight > 820 ? '55%' : '50%',
    },
    transactionContainer1: {
      marginTop: hp(10),
      height: windowHeight > 820 ? '54%' : '49%',
    },
    balanceContainer: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: hp(15),
      backgroundColor: isThemeDark ? '#111111' : '#E9EEEF',
      padding: hp(20),
    },
  });

const DefaultCoin = ({
  asset,
  loading,
  refreshingStatus,
  onRefresh,
}: {
  asset: Asset;
  loading: boolean;
  refreshingStatus: boolean;
  onRefresh: () => void;
}) => {
  const theme: AppTheme = useTheme();
  const listPaymentshMutation = useMutation(ApiHandler.listPayments);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);
  const [refreshing, setRefreshing] = useState(false);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [refresh, setRefresh] = useState(false);
  const styles = getStyles(theme, isThemeDark);
  const navigation = useNavigation();
  const { appType } = useContext(AppContext);
  const wallet: Wallet = useWallets({}).wallets[0];
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const rgbWallet = useRgbWallets({}).wallets[0];
  const { getBalance, getCurrencyIcon } = useBalance();
  const coinsResult = useQuery<Coin>(RealmSchema.Coin, collection =>
    collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );
  const nonDefaultCoins = coinsResult.filter(
    coin => coin.assetId !== asset.assetId,
  ).length;
  const transactionsData =
    appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN
      ? Object.values({
          ...asset?.transactions,
        }).sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime() || 0;
          const dateB = new Date(b.createdAt).getTime() || 0;
          return dateA - dateB;
        })
      : asset?.transactions.slice(0, 4);

  const btcBalance = useMemo(() => {
    if (
      app?.appType === AppType.NODE_CONNECT ||
      app?.appType === AppType.SUPPORTED_RLN
    ) {
      return rgbWallet?.nodeBtcBalance?.vanilla?.spendable || '';
    }
    return (
      wallet?.specs?.balances?.confirmed + wallet?.specs?.balances?.unconfirmed
    );
  }, [
    app?.appType,
    rgbWallet?.nodeBtcBalance?.vanilla?.spendable,
    wallet?.specs.balances,
  ]);

  return (
    <View
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControlView
          refreshing={refreshingStatus}
          onRefresh={onRefresh}
        />
      }>
      {asset.campaign.isActive === 'true' && (
        <GradientBorderAnimated
          height={hp(90)}
          radius={hp(20)}
          strokeWidth={1}
          style={styles.campaignContainer}>
          <AppText
            style={{
              color: theme.colors.headingColor,
              textAlign: 'center',
              marginTop: hp(15),
            }}
            variant="body1">
            {asset.campaign.name}
          </AppText>
        </GradientBorderAnimated>
      )}
      <AppTouchable
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate(NavigationRoutes.COINDETAILS, {
            assetId: asset.assetId,
          })
        }
        style={[
          styles.largeHeaderContainer,
          { marginTop: asset.campaign.isActive === 'true' ? -hp(50) : 0 },
        ]}>
        <View style={styles.row}>
          <View style={styles.coinNameContainer}>
            <AppText variant="heading1">{asset.name}</AppText>
            <AppText style={styles.totalBalanceLabel} variant="body2">
              Total Balance
            </AppText>

            <AppText variant="heading1" style={styles.totalBalance}>
              {formatLargeNumber(
                Number(asset?.balance?.spendable) / 10 ** asset.precision,
              )}
            </AppText>
          </View>
          <AssetIcon
            iconUrl={asset.iconUrl}
            assetID={asset.assetId}
            size={80}
            verified={asset?.issuer?.verified}
          />
        </View>

        <TransactionButtons
          onPressSend={() => {
            navigation.navigate(NavigationRoutes.SCANASSET, {
              assetId: asset.assetId,
              rgbInvoice: '',
              wallet: wallet,
            });
          }}
          onPressReceive={() => {
            navigation.navigate(NavigationRoutes.ENTERINVOICEDETAILS, {
              invoiceAssetId: asset.assetId,
              chosenAsset: asset,
            });
          }}
          sendCtaWidth={wp(150)}
          receiveCtaWidth={wp(150)}
        />
      </AppTouchable>

      <View style={styles.row}>
        <AppTouchable
          style={styles.balanceContainer}
          onPress={() => {
            navigation.navigate(NavigationRoutes.WALLETDETAILS);
          }}>
          <IconBitcoin />
          <View style={{ marginVertical: hp(15) }} />
          <AppText style={styles.totalBalanceLabel} variant="body2">
            Bitcoin Balance
          </AppText>
          <AppText style={styles.totalBalance} variant="heading1">
            {getBalance(Number(btcBalance))}
          </AppText>
        </AppTouchable>
        <View style={{ marginHorizontal: wp(5) }} />

        <AppTouchable
          style={styles.balanceContainer}
          onPress={() => {
            navigation.navigate(NavigationRoutes.ASSETS);
          }}>
          <IconOtherAssets />
          <View style={{ marginVertical: hp(15) }} />

          <AppText style={styles.totalBalanceLabel} variant="body2">
            Other Assets
          </AppText>
          <AppText style={styles.totalBalance} variant="heading1">
            {nonDefaultCoins}
          </AppText>
        </AppTouchable>
      </View>

      <TransactionsList
        style={
          appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN
            ? styles.transactionContainer1
            : styles.transactionContainer
        }
        transactions={transactionsData}
        isLoading={loading}
        refresh={onRefresh}
        refreshingStatus={refreshing}
        navigation={navigation}
        wallet={wallet}
        coin={asset.name}
        assetId={asset.assetId}
        precision={asset.precision}
        scrollY={0}
        schema={RealmSchema.Coin}
      />
    </View>
  );
};

export default DefaultCoin;
