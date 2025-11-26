import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import React, { useContext, useMemo, useRef, useState } from 'react';
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
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
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
import Fonts from 'src/constants/Fonts';
import { formatTUsdt } from 'src/utils/snakeCaseToCamelCaseCase';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconVerified from 'src/assets/images/issuer_verified.svg';
import DeepLinking from 'src/utils/DeepLinking';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';
import Colors from 'src/theme/Colors';
import { TapGestureHandler } from 'react-native-gesture-handler';
const CARD_HEIGHT = 245;

const getStyles = (theme: AppTheme, isThemeDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginHorizontal: wp(10),
      backgroundColor: theme.colors.primaryBackground,
    },
    largeHeaderContainer: {
      borderColor: isThemeDark ? '#111' : '#fff',
      borderWidth: 1,
      borderRadius: hp(20),
      backgroundColor: isThemeDark ? '#111' : '#fff',
      alignItems: 'center',
      height: CARD_HEIGHT,
      justifyContent: 'space-between',
    },
    largeHeaderContainer1: {
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: hp(20),
      backgroundColor: isThemeDark ? '#111' : '#fff',
      alignItems: 'center',
      height: CARD_HEIGHT,
    },
    row: {
      flexDirection: 'row',
      marginBottom: hp(20),
    },
    list: {
      height: CARD_HEIGHT,
    },
    coinNameContainer: {
      flex: 1,
      minWidth: 0,
    },
    totalBalance: {
      marginTop: hp(10),
      color: theme.colors.headingColor,
      fontSize: 26,
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
      marginBottom: hp(2),
      marginTop: hp(10),
    },
    totalBalanceLabel: {
      color: theme.colors.secondaryHeadingColor,
      marginBottom: hp(-10),
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
      height: CARD_HEIGHT,
      borderRadius: hp(20),
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
      borderBottomRightRadius: hp(20),
      borderBottomLeftRadius: hp(20),
      experimental_backgroundImage: 'linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.9))'
    },
    textCollectibleName: {
      marginLeft: wp(10),
      marginRight: wp(5),
      fontWeight: '500',
      color: 'white',
    },
    textCollectibleDescription: {
      marginHorizontal: wp(10),
      color: 'white',
      fontFamily: Fonts.LufgaMedium,
      fontWeight: '500',
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
      backgroundColor: isThemeDark ? 'white' : 'black',
    },
    loaderOverlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10000,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rgbBorderCtr: {
      borderTopLeftRadius: hp(20),
      borderTopRightRadius: hp(20),
      zIndex: -1000,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    activeCampaignBorder: {
      position: 'relative',
      top: hp(1),
      paddingTop: 0,
      height: CARD_HEIGHT - hp(1),
    },
    activeCampaignDetailsCtr: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    campaignTxt: {
      textAlign: 'center',
      color: Colors.White,
      marginBottom: hp(10),
      marginTop: hp(5),
    },
    coinCampaignTxtCtr: {
      borderTopLeftRadius: hp(20),
      borderTopRightRadius: hp(20),
      width: '100%',
      position: 'absolute',
      experimental_backgroundImage: 'linear-gradient(180deg, rgba(0, 0, 0, 1), rgba(17, 17, 17, 0))'
    },
    collectionCampaignTxtCtr: {
      borderTopLeftRadius: hp(20),
      borderTopRightRadius: hp(20),
      experimental_backgroundImage: 'linear-gradient(180deg, rgba(0, 0, 0, 1), rgba(17, 17, 17, 0))'
    },
    coinDataCtr: {
      padding: hp(20),
      paddingTop: hp(40),
      justifyContent: 'space-between',
      flex: 1,
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

const RgbBorder = ({ styles }) => (
  <GradientBorderAnimated
    height={CARD_HEIGHT / 4}
    radius={hp(20)}
    strokeWidth={2}
    style={styles.rgbBorderCtr}/>
);

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
  const collectible = useQuery<Collectible>(
    RealmSchema.Collectible,
    collection => collection.filtered(`assetId = $0`, asset.assetId),
  )[0];
  const [imageLoading, setImageLoading] = useState(false);

  const description = useMemo(() => {
    if (isCollectible) {
      return `${assets.totalBalance}: ${formatLargeNumber(
        Number(collectible?.balance.spendable) / 10 ** collectible?.precision,
      )}`;
    } else if (isCollection) {
      return `${assets.minted}: ${asset.items.length}/${
        asset.itemsCount === 0 ? '∞' : asset.itemsCount
      }`;
    }
    return '';
  }, [isCollectible, asset.details, asset.description]);

  const isCampaignActive = asset?.campaign?.isActive == 'true';

  return (
    <>
      {isCampaignActive && <RgbBorder styles={styles} />}
      <TapGestureHandler
        maxDeltaX={10}
        maxDeltaY={10}
        onActivated={() => {
          if (isCollectible) {
            navigation.navigate(NavigationRoutes.COLLECTIBLEDETAILS, {
              assetId: asset.assetId,
            });
          } else if (isCollection) {
            navigation.navigate(NavigationRoutes.COLLECTIONDETAILS, {
              collectionId: asset.collectionId,
            });
          } else {
            navigation.navigate(NavigationRoutes.UDADETAILS, {
              assetId: asset.assetId,
            });
          }
        }}>
        <View
          style={[
            styles.largeHeaderContainer1,
            isCampaignActive && styles.activeCampaignBorder,
          ]}>
          <ImageBackground
            source={{
              uri: isCollectible ? asset.media?.filePath : asset.media.filePath,
            }}
            resizeMode="cover"
            style={styles.imageBackground}
            imageStyle={styles.imageBackground}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}>
            <View style={styles.textCollectibleNameContainer}>
              {imageLoading && (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator />
                </View>
              )}

              {isCampaignActive && (
                <View style={styles.activeCampaignDetailsCtr}>
                  <View style={[styles.collectionCampaignTxtCtr]}>
                    <AppText variant="subtitle2" style={styles.campaignTxt}>
                      {asset?.campaign?.name}
                    </AppText>
                  </View>
                </View>
              )}

              <View
                style={styles.textCollectibleNameContainer1}
              >
                <View style={styles.textCollectibleNameContainer2}>
                  <AppText
                    variant="body1Bold"
                    style={styles.textCollectibleName}>
                    {asset.name}
                  </AppText>
                  {asset.issuer?.verified ? (
                    <IconVerified width={24} height={24} />
                  ) : null}
                </View>
                {
                  <AppText
                    variant="muted"
                    style={styles.textCollectibleDescription}>
                    {description}
                  </AppText>
                }
              </View>
            </View>
          </ImageBackground>
        </View>
      </TapGestureHandler>
    </>
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
  const coin: Coin = useQuery(RealmSchema.Coin, collection =>
    collection.filtered(`assetId = $0`, asset.assetId),
  )[0];
  const isCampaignActive = asset?.campaign?.isActive == 'true';

  return (
    <>
      {isCampaignActive && <RgbBorder styles={styles} />}
      <TapGestureHandler
        maxDeltaX={10} // 👈 prevent tap if user moves more than 10px horizontally
        maxDeltaY={10}
        onActivated={() =>
          navigation.navigate(NavigationRoutes.COINDETAILS, {
            assetId: asset.assetId,
          })
        }>
        <View
          style={[
            styles.largeHeaderContainer,
            isCampaignActive && styles.activeCampaignBorder,
          ]}>
          {isCampaignActive && (
            <View
              style={styles.coinCampaignTxtCtr}>
              <AppText variant="subtitle2" style={styles.campaignTxt}>
                {asset?.campaign?.name}
              </AppText>
            </View>
          )}

          <View style={styles.coinDataCtr}>
            <View style={styles.row}>
              <View style={styles.coinNameContainer}>
                <AppText variant="heading1">{formatTUsdt(asset.name)}</AppText>
                <AppText style={styles.totalBalanceLabel} variant="body2">
                  {assets.totalBalance}
                </AppText>
                <DecimalText
                  value={
                    Number(coin?.balance?.spendable) / 10 ** coin?.precision
                  }
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
          </View>
        </View>
      </TapGestureHandler>
    </>
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
        `visibility != $0 && NOT details CONTAINS '${DeepLinking.appLinkScheme}'`,
        AssetVisibility.HIDDEN,
      ),
  );
  const collections = useQuery<Collection>(RealmSchema.Collection, collection =>
    collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );
  const carouselRef = useRef(null);
  const progress = useSharedValue<number>(0);

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
    return collectibles.length + udas.length + collections.length + coins.length;
  }, [collectibles, udas, collections, coins]);
  
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

  const onPressPagination = (index: number) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Carousel
          enabled={presetAssets.length > 1}
          ref={carouselRef}
          style={styles.list}
          width={windowWidth * 0.94}
          height={CARD_HEIGHT + hp(7)}
          data={presetAssets}
          onSnapToItem={setCurrentIndex}
          onProgressChange={progress}
          vertical
          renderItem={({ item: asset }) => (
            <View>
              {asset.collectionSchema ? (
                <CollectionItem
                  item={asset}
                  isCollectible={false}
                  isCollection={true}
                />
              ) : asset.metaData.assetSchema === AssetSchema.Collectible ? (
                <CollectionItem
                  item={asset}
                  isCollectible={true}
                  isCollection={false}
                />
              ) : asset.metaData.assetSchema === AssetSchema.UDA ? (
                <CollectionItem
                  item={asset}
                  isCollectible={false}
                  isCollection={false}
                />
              ) : asset.metaData.assetSchema === AssetSchema.Coin ? (
                <CoinItem item={asset} isWalletOnline={isWalletOnline} />
              ) : null}
            </View>
          )}
        />
        <View style={styles.containerScrollIndicator}>
          <Pagination.Basic
            progress={progress}
            data={presetAssets}
            dotStyle={styles.scrollIndicatorItem}
            activeDotStyle={styles.scrollIndicatorItemCurrent}
            onPress={onPressPagination}
            horizontal={false}
          />
        </View>
      </View>

      <View style={styles.row}>
        <AppTouchable
          style={styles.balanceContainer}
          onPress={() => {
            navigation.navigate(NavigationRoutes.WALLETDETAILS, {autoRefresh: true});
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
