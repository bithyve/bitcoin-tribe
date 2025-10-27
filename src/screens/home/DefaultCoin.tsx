import {
  FlatList,
  ImageBackground,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import React, { useContext, useMemo, useState } from 'react';
import {
  Asset,
  AssetSchema,
  AssetVisibility,
  Coin,
  Collectible,
  Collection,
  UniqueDigitalAsset,
  WalletOnlineStatus,
} from 'src/models/interfaces/RGBWallet';
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
import { formatTUsdt } from 'src/utils/snakeCaseToCamelCaseCase';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import LinearGradient from 'react-native-linear-gradient';
import IconVerified from 'src/assets/images/issuer_verified.svg';
import DeepLinking from 'src/utils/DeepLinking';

const getStyles = (theme: AppTheme, isThemeDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginHorizontal: wp(10),
      backgroundColor: theme.colors.primaryBackground,
    },
    largeHeaderContainer: {
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: hp(20),
      backgroundColor: isThemeDark ? '#111' : '#fff',
      padding: hp(20),
      marginBottom: hp(10),
      alignItems: 'center',
    },
    largeHeaderContainer1: {
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: hp(20),
      backgroundColor: isThemeDark ? '#111' : '#fff',
      marginBottom: hp(10),
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      marginBottom: hp(20),
    },
    list: {
      height: 245,
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
    imageBackground: {
      width: '100%',
      height: 245,
      borderRadius: hp(15),
    },
    textCollectibleNameContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    textCollectibleNameContainer2: {
      flex: 1,
      alignItems: 'flex-end',
      flexDirection: 'row',
      paddingBottom: hp(10),
      paddingTop: hp(15),
    },
    textCollectibleNameContainer1: {
      flex: 1,
      alignItems: 'center',
      flexDirection: 'row',
      paddingBottom: hp(10),
      paddingTop: hp(15),
    },
    textCollectibleName: {
      marginLeft: wp(10),
      marginRight: wp(5),
      fontWeight: '500',
      color: 'white',
    },
    textCollectibleDescription: {
      marginHorizontal: wp(10),
      fontSize: 14,
      color: 'white',
    },
    containerScrollIndicator: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: wp(2),
    },
    scrollIndicatorItem: {
      width: 6,
      height: 6,
      borderRadius: 5,
      backgroundColor: isThemeDark ? '#272726' : 'lightgrey',
      marginVertical: wp(2),
    },
    scrollIndicatorItemCurrent: {
      width: 6,
      height: 6,
      borderRadius: 5,
      backgroundColor: isThemeDark ? 'white' : 'black',
      marginVertical: wp(2),
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
          .{fractionalPart.substring(0, 2)}
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

const CollectionItem = ({
  item: asset,
  isCollectible,
  isCollection,
}: {
  item: Asset;
  isCollectible: boolean;
  isCollection: boolean;
}) => {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme, isThemeDark);
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const collectible = useQuery<Collectible>(RealmSchema.Collectible, collection =>
    collection.filtered(`assetId = $0`, asset.assetId),
  )[0];
  
  const description = useMemo(() => {
    if (isCollectible) {
      return `${assets.totalBalance}: ${formatLargeNumber(Number(collectible?.balance.spendable) / 10 ** collectible?.precision)}`;
    } else if (isCollection) {
      return `Issued: ${asset.items.length}/${
        asset.itemsCount === 0 ? '∞' : asset.itemsCount
      }`;
    }
    return '';
  }, [isCollectible, asset.details, asset.description]);

  return (
    <AppTouchable
      activeOpacity={0.95}
      onPress={() => {
        if(isCollectible) {
          navigation.navigate(NavigationRoutes.COLLECTIBLEDETAILS, {
            assetId: asset.assetId,
          });
        } else if(isCollection) {
          navigation.navigate(NavigationRoutes.COLLECTIONDETAILS, {
            collectionId: asset.collectionId,
          });
        } else{
          navigation.navigate(NavigationRoutes.UDADETAILS, {
            assetId: asset.assetId,
          });
        }
      }}
      style={[
        styles.largeHeaderContainer1,
        {
          marginTop: asset?.campaign?.isActive === 'true' ? -hp(50) : 0,
        },
      ]}>
      <ImageBackground
        source={{
          uri: isCollectible ? asset.media?.filePath : asset.media.filePath,
        }}
        resizeMode="cover"
        style={styles.imageBackground}
        imageStyle={styles.imageBackground}>
        <View style={styles.textCollectibleNameContainer}>
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0.4)',
              'rgba(0, 0, 0, 0.9)',
            ]}
            style={styles.textCollectibleNameContainer1}>
            <View style={styles.textCollectibleNameContainer2}>
              <AppText variant="heading2" style={styles.textCollectibleName}>
                {asset.name}
              </AppText>
              {asset.issuer?.verified ? <IconVerified width={24} height={24} /> : null}
            </View>
            {
              <AppText
                variant="body2"
                style={styles.textCollectibleDescription}>
                {description}
              </AppText>
            }
          </LinearGradient>
        </View>
      </ImageBackground>
    </AppTouchable>
  );
};

const CoinItem = ({
  item: asset,
  isWalletOnline,
}: {
  item: Asset;
  isWalletOnline: WalletOnlineStatus;
}) => {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme, isThemeDark);
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const coin : Coin = useQuery(RealmSchema.Coin, collection =>
    collection.filtered(`assetId = $0`, asset.assetId),
  )[0];

  return (
    <AppTouchable
      activeOpacity={0.95}
      onPress={() =>
        navigation.navigate(NavigationRoutes.COINDETAILS, {
          assetId: asset.assetId,
        })
      }
      style={[
        styles.largeHeaderContainer,
        {
          marginTop: asset?.campaign?.isActive === 'true' ? -hp(50) : 0,
        },
      ]}>
      <View style={styles.row}>
        <View style={styles.coinNameContainer}>
          <AppText variant="heading1">{formatTUsdt(asset.name)}</AppText>
          <AppText style={styles.totalBalanceLabel} variant="body2">
            {assets.totalBalance}
          </AppText>
          <DecimalText
            value={Number(coin?.balance?.spendable) / 10 ** coin?.precision}
            unit={formatTUsdt(asset.ticker)}
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
        disabled={
          isWalletOnline === WalletOnlineStatus.Error ||
          isWalletOnline === WalletOnlineStatus.InProgress
        }
      />
    </AppTouchable>
  );
};

const DefaultCoin = ({
  presetAssets,
  refreshingStatus,
  onRefresh,
}: {
  presetAssets: Asset[];
  refreshingStatus: boolean;
  onRefresh: () => void;
}) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme, isThemeDark);
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;
  const { appType, isWalletOnline } = useContext(AppContext);
  const wallet: Wallet = useWallets({}).wallets[0];
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const rgbWallet = useRgbWallets({}).wallets[0];
  const { getBalance, getCurrencyIcon } = useBalance();
  const coins = useQuery<Coin>(RealmSchema.Coin, collection =>
    collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAssetSchema, setCurrentAssetSchema] = useState(null)
  const collectibles = useQuery<Collectible>(
    RealmSchema.Collectible,
    collection =>
      collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );
  const udas = useQuery<UniqueDigitalAsset>(
    RealmSchema.UniqueDigitalAsset,
    collection =>
      collection.filtered(
        `visibility != $0 && NOT details CONTAINS '${DeepLinking.scheme}://'`,
        AssetVisibility.HIDDEN,
      ),
  );
  const collections = useQuery<Collection>(RealmSchema.Collection, collection =>
    collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );

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
    return collectibles.length + udas.length + collections.length;
  }, [collectibles, udas, collections]);
  
  const currentAsset = useMemo(() => {
    const asset = presetAssets[currentIndex];
    if(asset?.metaData?.assetSchema === AssetSchema.Coin) {
      setCurrentAssetSchema(RealmSchema.Coin);
      return coins.find(coin => coin.assetId === asset.assetId);
    } else if(asset?.metaData?.assetSchema === AssetSchema.Collectible) {
      setCurrentAssetSchema(RealmSchema.Collectible);
      return collectibles.find(collectible => collectible.assetId === asset.assetId);
    } else if(asset?.collectionSchema) {
      setCurrentAssetSchema(RealmSchema.Collection);
      return collections.find(collection => collection.assetId === asset.assetId);
    } else if(asset?.metaData?.assetSchema === AssetSchema.UDA) {
      setCurrentAssetSchema(RealmSchema.UniqueDigitalAsset);
      return udas.find(uda => uda.assetId === asset.assetId);
    }
    return null;
  }, [currentIndex, presetAssets]);

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
      <View style={styles.row}>
        <FlatList
          data={presetAssets}
          style={styles.list}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onScroll={event => {
            const { contentOffset } = event.nativeEvent;
            const index = Math.round(contentOffset.y / 245);
            setCurrentIndex(index);
          }}
          renderItem={({ item: asset }) => (
            <View>
              {asset?.campaign?.isActive === 'true' && (
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
                      {asset?.campaign?.name}
                    </AppText>
                  </GradientBorderAnimated>
                </AppTouchable>
              )}

              {asset.collectionSchema ? (
                <CollectionItem
                  item={asset}
                  isCollectible={false}
                  isCollection={true}
                />
              ) : asset.metaData.assetSchema === AssetSchema.Collectible ? (
                <CollectionItem item={asset} isCollectible={true} isCollection={false} />
              ) : asset.metaData.assetSchema === AssetSchema.UDA ? (
                <CollectionItem item={asset} isCollectible={false} isCollection={false} />
              ) : asset.metaData.assetSchema === AssetSchema.Coin ? (
                <CoinItem item={asset} isWalletOnline={isWalletOnline} />
              ) : null}
            </View>
          )}
        />
        <View style={styles.containerScrollIndicator}>
          {presetAssets.map((asset, index) => (
            <View
              key={index}
              style={
                currentIndex === index
                  ? styles.scrollIndicatorItemCurrent
                  : styles.scrollIndicatorItem
              }
            />
          ))}
        </View>
      </View>

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
        transactions={currentAsset?.transactions || []}
        isLoading={false}
        refresh={onRefresh}
        refreshingStatus={false}
        wallet={wallet}
        coin={currentAsset?.name || presetAssets[currentIndex].name}
        assetId={currentAsset?.assetId || presetAssets[currentIndex].assetId}
        precision={currentAsset?.precision || 0}
        scrollY={0}
        schema={currentAssetSchema}
      />
    </View>
  );
};

export default DefaultCoin;
