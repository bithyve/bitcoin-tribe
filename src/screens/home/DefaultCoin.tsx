import { Platform, StyleSheet, View } from 'react-native';
import React, { useContext, useMemo } from 'react';
import { Asset, AssetVisibility, Coin, Collectible, UniqueDigitalAsset } from 'src/models/interfaces/RGBWallet';
import AppText from 'src/components/AppText';
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
import Fonts from 'src/constants/Fonts';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const getStyles = (theme: AppTheme, isThemeDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginHorizontal: wp(15),
      backgroundColor: theme.colors.primaryBackground,
    },
    largeHeaderContainer: {
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: hp(20),
      backgroundColor: isThemeDark ? '#111' : '#fff',
      padding: hp(20),
      marginBottom: hp(10),
      alignItems: 'center'
    },
    row: {
      flexDirection: 'row',
      marginBottom: hp(20),
    },
    coinNameContainer: {
      flex: 1,
      minWidth: 0,
    },
    totalBalance: {
      marginTop: hp(10),
      color: theme.colors.headingColor,
      fontSize: 30,
    },
    totalBalanceDecimal: {
      color: theme.colors.headingColor,
      fontSize: 18,
      alignSelf: 'flex-end',
      marginBottom: Platform.OS === 'ios' ? hp(3) : hp(3),
      flexShrink: 1,
    },
    textUnit: {
      fontSize: 16,
      color: theme.colors.secondaryHeadingColor,
      alignSelf: 'flex-end',
      marginBottom: Platform.OS === 'ios' ? hp(6) : hp(2),
      marginTop: hp(10),
    },
    totalBalanceLabel: {
      color: theme.colors.secondaryHeadingColor,
      marginBottom: hp(-10),
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

const DecimalText = ({ value, unit }: { value: number; unit?: string }) => {
  const integerPart = value.toString().split('.')[0];
  const fractionalPart = value.toString().split('.')[1];
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme, isThemeDark);

  return (
    <View style={styles.row}>
      <AppText 
        variant="heading1" 
        style={styles.totalBalance}
        numberOfLines={1}
        ellipsizeMode="tail">
        {formatLargeNumber(Number(integerPart))}
      </AppText>
      {fractionalPart && (
        <AppText 
          variant="body1" 
          style={styles.totalBalanceDecimal}
          numberOfLines={1}
          ellipsizeMode="tail">
          .{fractionalPart.substring(0,2)}
        </AppText>
      )}
      {unit && (
        <AppText 
          variant="heading2" 
          style={styles.textUnit}
          numberOfLines={1}
          ellipsizeMode="tail">
          {` ${unit}`}
        </AppText>
      )}
    </View>
  );
};

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
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme, isThemeDark);
  const navigation = useNavigation();
  const { appType } = useContext(AppContext);
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const wallet: Wallet = useWallets({}).wallets[0];
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const rgbWallet = useRgbWallets({}).wallets[0];
  const { getBalance, getCurrencyIcon } = useBalance();
  const coinsResult = useQuery<Coin>(RealmSchema.Coin, collection =>
    collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );
    const collectibles = useQuery<Collectible>(RealmSchema.Collectible, collection =>
    collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );
  const udas = useQuery<UniqueDigitalAsset>(RealmSchema.UniqueDigitalAsset, collection =>
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
      : asset?.transactions.slice(0, 3);

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

  const totalAssets = useMemo(() => {
    return nonDefaultCoins + collectibles.length + udas.length;
  }, [nonDefaultCoins, collectibles, udas]);

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
        <AppTouchable
          activeOpacity={0.95}
          onPress={() =>
            navigation.navigate(NavigationRoutes.COINDETAILS, {
              assetId: asset.assetId,
            })
          }>
          <GradientBorderAnimated
            height={hp(95)}
            radius={hp(20)}
            strokeWidth={2}
            style={styles.campaignContainer}>
            <AppText
              style={{
                color: theme.colors.headingColor,
                textAlign: 'center',
                marginTop: hp(15),
                fontSize: 16,
                fontWeight: '400',
                fontFamily: Fonts.LufgaMedium,
                lineHeight: 16 * 1.6,
              }}>
              {asset.campaign.name}
            </AppText>
          </GradientBorderAnimated>
        </AppTouchable>
      )}
      <AppTouchable
        activeOpacity={0.95}
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
              {assets.totalBalance}
            </AppText>
            <DecimalText
              value={Number(asset?.balance?.spendable) / 10 ** asset.precision}
              unit={asset.ticker}
            />
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
          <View style={{ marginVertical: hp(20) }} />
          <AppText style={styles.totalBalanceLabel} variant="body2">
            {assets.bitcoinBalance}
          </AppText>
          <DecimalText value={Number(btcBalance)} unit={'sats'} />
        </AppTouchable>
        <View style={{ marginHorizontal: wp(7) }} />

        <AppTouchable
          style={styles.balanceContainer}
          onPress={() => {
            navigation.navigate(NavigationRoutes.ASSETS);
          }}>
          <IconOtherAssets />
          <View style={{ marginVertical: hp(20) }} />

          <AppText style={styles.totalBalanceLabel} variant="body2">
            {assets.otherAssets}
          </AppText>
          <AppText style={styles.totalBalance} variant="heading1">
            {totalAssets}
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
        isLoading={false}
        refresh={onRefresh}
        refreshingStatus={false}
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
