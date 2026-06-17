import {
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
  InflatableFungibleAsset,
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
import { CustomImage } from 'src/components/CustomImage';
import IconSend from 'src/assets/images/ic_send.svg';
import IconSendLight from 'src/assets/images/ic_send_light.svg';
import IconReceive from 'src/assets/images/icon_recieve.svg';
import IconReceiveLight from 'src/assets/images/icon_recieve_light.svg';
const CARD_HEIGHT = 245;

const getStyles = (theme: AppTheme, isThemeDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginHorizontal: wp(16),
      backgroundColor: theme.colors.primaryBackground,
      paddingBottom: hp(95),
    },
    largeHeaderContainer: {
      borderColor: isThemeDark ? '#232323' : '#E4E7EC',
      borderWidth: 1,
      borderRadius: hp(24),
      backgroundColor: isThemeDark ? '#1A1A1A' : '#FFFFFF',
      alignItems: 'center',
      height: CARD_HEIGHT,
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    largeHeaderContainer1: {
      borderRadius: hp(20),
      backgroundColor: isThemeDark ? '#111' : '#fff',
      alignItems: 'center',
      height: CARD_HEIGHT,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardRow: {
      flexDirection: 'row',
      marginBottom: hp(14),
    },
    list: {
      height: CARD_HEIGHT + hp(6),
    },
    coinNameContainer: {
      flex: 1,
      minWidth: 0,
    },
    totalBalance: {
      marginTop: hp(6),
      color: isThemeDark ? '#FFFFFF' : '#101828',
      fontSize: 50,
      lineHeight: 52,
      fontFamily: Fonts.LufgaBold,
    },
    totalBalanceDecimal: {
      color: isThemeDark ? '#FFFFFF' : '#101828',
      fontSize: 26,
      alignSelf: 'flex-end',
      marginBottom: Platform.OS === 'ios' ? hp(8) : hp(8),
      flexShrink: 1,
      fontFamily: Fonts.LufgaSemiBold,
    },
    textUnit: {
      fontSize: 16,
      color: isThemeDark ? '#787878' : '#667085',
      alignSelf: 'flex-end',
      marginBottom: hp(10),
      marginTop: hp(8),
    },
    totalBalanceLabel: {
      color: isThemeDark ? '#787878' : '#667085',
      marginBottom: hp(-2),
      fontSize: 15,
      fontFamily: Fonts.LufgaMedium,
    },
    totalBalanceLabelMini: {
      color: '#FFFFFF',
      fontSize: 18,
      fontFamily: Fonts.LufgaSemiBold,
      marginTop: hp(4),
    },
    transactionContainer: {
      marginTop: hp(4),
      height: windowHeight > 820 ? '52%' : '49%',
    },
    transactionContainer1: {
      marginTop: hp(4),
      height: windowHeight > 820 ? '52%' : '49%',
    },
    balanceContainer: {
      flex: 1,
      borderRadius: hp(18),
      backgroundColor: isThemeDark ? '#1A1A1A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isThemeDark ? '#232323' : '#E4E7EC',
      paddingHorizontal: hp(14),
      paddingVertical: hp(12),
      minHeight: hp(122),
      justifyContent: 'space-between',
    },
    imageBackground: {
      width: '100%',
      height: CARD_HEIGHT,
      borderRadius: hp(20),
    },
    textCollectibleNameContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      position: 'absolute',
      zIndex: 1000,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
      experimental_backgroundImage:
        'linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.9))',
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
      experimental_backgroundImage:
        'linear-gradient(180deg, rgba(0, 0, 0, 1), rgba(17, 17, 17, 0))',
    },
    collectionCampaignTxtCtr: {
      borderTopLeftRadius: hp(20),
      borderTopRightRadius: hp(20),
      experimental_backgroundImage:
        'linear-gradient(180deg, rgba(0, 0, 0, 1), rgba(17, 17, 17, 0))',
    },
    coinDataCtr: {
      paddingHorizontal: hp(20),
      paddingTop: hp(24),
      paddingBottom: hp(16),
      justifyContent: 'space-between',
      flex: 1,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: hp(4),
    },
    actionBtnPrimary: {
      width: '48.5%',
      height: hp(44),
      borderRadius: hp(14),
      backgroundColor: '#0166FF',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    actionBtnSecondary: {
      width: '48.5%',
      height: hp(44),
      borderRadius: hp(14),
      backgroundColor: isThemeDark ? '#1E1E1E' : '#F2F4F7',
      borderColor: isThemeDark ? '#2E2E2E' : '#E4E7EC',
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    actionBtnText: {
      marginLeft: wp(6),
      color: isThemeDark ? '#FFFFFF' : '#101828',
      fontSize: 16,
      fontFamily: Fonts.LufgaSemiBold,
    },
    miniHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(8),
    },
    miniHeaderIconGap: {
      marginLeft: wp(8),
    },
    miniLabelInline: {
      color: isThemeDark ? '#FFFFFF' : '#101828',
      fontSize: 16,
      fontFamily: Fonts.LufgaSemiBold,
    },
    miniValue: {
      color: isThemeDark ? '#FFFFFF' : '#101828',
      fontSize: 28,
      lineHeight: 30,
      fontFamily: Fonts.LufgaBold,
      marginTop: hp(2),
      flexShrink: 1,
    },
    miniSubValue: {
      color: '#616161',
      fontSize: 14,
      marginTop: hp(4),
      fontFamily: Fonts.LufgaRegular,
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
        }}
      >
        <View
          style={[
            styles.largeHeaderContainer1,
            isCampaignActive && styles.activeCampaignBorder,
          ]}
        >
          <View style={styles.imageBackground}>
            <CustomImage
              uri={isCollectible ? asset.media?.filePath : asset.media.filePath}
              imageStyle={styles.imageBackground}
            />
          </View>
          <View style={styles.textCollectibleNameContainer}>
            {isCampaignActive && (
              <View style={styles.activeCampaignDetailsCtr}>
                <View style={[styles.collectionCampaignTxtCtr]}>
                  <AppText variant="subtitle2" style={styles.campaignTxt}>
                    {asset?.campaign?.name}
                  </AppText>
                </View>
              </View>
            )}

            <View style={styles.textCollectibleNameContainer1}>
              <View style={styles.textCollectibleNameContainer2}>
                <AppText variant="body1Bold" style={styles.textCollectibleName}>
                  {asset.name}
                </AppText>
                {asset.issuer?.verified ? (
                  <IconVerified width={24} height={24} />
                ) : null}
              </View>
              {
                <AppText
                  variant="muted"
                  style={styles.textCollectibleDescription}
                >
                  {description}
                </AppText>
              }
            </View>
          </View>
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
  const disabled =
    isWalletOnline === WalletOnlineStatus.Error ||
    isWalletOnline === WalletOnlineStatus.InProgress;

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
                <AppText style={styles.totalBalanceLabel} variant="body2">
                  {`${formatTUsdt(asset.name)} · ${assets.totalBalance}`}
                </AppText>
                <DecimalText
                  value={
                    Number(coin?.balance?.spendable) / 10 ** coin?.precision
                  }
                />
              </View>
              <AssetIcon
                iconUrl={asset.iconUrl}
                assetID={asset.assetId}
                size={56}
                verified={asset?.issuer?.verified}
              />
            </View>

            <View style={styles.actionRow}>
              <AppTouchable
                disabled={disabled}
                style={styles.actionBtnPrimary}
                onPress={() => {
                  navigation.navigate(NavigationRoutes.SCANASSET, {
                    assetId: asset.assetId,
                    rgbInvoice: '',
                  });
                }}>
                {isThemeDark ? <IconSend /> : <IconSendLight />}
                <AppText style={styles.actionBtnText}>Send</AppText>
              </AppTouchable>
              <AppTouchable
                disabled={disabled}
                style={styles.actionBtnSecondary}
                onPress={() => {
                  navigation.navigate(NavigationRoutes.ENTERINVOICEDETAILS, {
                    invoiceAssetId: asset.assetId,
                    chosenAsset: asset,
                  });
                }}>
                {isThemeDark ? <IconReceive /> : <IconReceiveLight />}
                <AppText style={styles.actionBtnText}>Receive</AppText>
              </AppTouchable>
            </View>
          </View>
        </View>
      </TapGestureHandler>
    </>
  );
};

const DefaultCoin = ({
  presetAssets,
  onRefresh,
}: {
  presetAssets: Asset[] | null;
  refreshingStatus: boolean;
  onRefresh: () => void;
}) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme, isThemeDark);
  const navigation = useNavigation();
  const { appType, isWalletOnline } = useContext(AppContext);
  const wallet: Wallet = useWallets({}).wallets[0];
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const rgbWallet = useRgbWallets({}).wallets[0];
  const { getBalance } = useBalance();
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

  const ifaCoins = useQuery<InflatableFungibleAsset>(
    RealmSchema.IFA,
    collection =>
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
    return (
      collectibles.length +
      udas.length +
      collections.length +
      coins.length +
      ifaCoins.length
    );
  }, [collectibles, udas, collections, coins, ifaCoins]);

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
      <View style={styles.cardRow}>
        <Carousel
          enabled={presetAssets && presetAssets.length > 1}
          ref={carouselRef}
          style={styles.list}
          width={windowWidth * 0.94}
          height={CARD_HEIGHT + hp(7)}
          data={presetAssets || []}
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
            data={presetAssets || []}
            dotStyle={styles.scrollIndicatorItem}
            activeDotStyle={styles.scrollIndicatorItemCurrent}
            onPress={onPressPagination}
            horizontal={false}
          />
        </View>
      </View>

      <View style={styles.cardRow}>
        <AppTouchable
          style={styles.balanceContainer}
          onPress={() => {
            navigation.navigate(NavigationRoutes.WALLETDETAILS, {
              autoRefresh: true,
            });
          }}
        >
          <View style={styles.miniHeaderRow}>
            <IconBitcoin />
            <View style={styles.miniHeaderIconGap}>
              <AppText style={styles.miniLabelInline} variant="body2">
                Bitcoin
              </AppText>
            </View>
          </View>
          <AppText
            style={styles.miniValue}
            variant="heading1"
            numberOfLines={1}
            ellipsizeMode="tail">
            {getBalance(Number(btcBalance))}
          </AppText>
        </AppTouchable>
        <View style={{ marginHorizontal: wp(7) }} />

        <AppTouchable
          style={styles.balanceContainer}
          onPress={() => {
            navigation.navigate(NavigationRoutes.ASSETS);
          }}
        >
          <View style={styles.miniHeaderRow}>
            <IconOtherAssets />
            <View style={styles.miniHeaderIconGap}>
              <AppText style={styles.miniLabelInline} variant="body2">
                Other Assets
              </AppText>
            </View>
          </View>
          <AppText
            style={styles.miniValue}
            variant="heading1"
            numberOfLines={1}
            ellipsizeMode="tail">
            {`${totalAssets} tokens`}
          </AppText>
        </AppTouchable>
      </View>

      <TransactionsList
        style={
          appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN
            ? styles.transactionContainer1
            : styles.transactionContainer
        }
        limitToVisibleRows
        transactions={currentAsset?.transactions || []}
        isLoading={false}
        refresh={onRefresh}
        refreshingStatus={false}
        coin={currentAsset?.name || presetAssets?.[currentIndex]?.name}
        assetId={currentAsset?.assetId || presetAssets?.[currentIndex]?.assetId}
        precision={currentAsset?.precision || 0}
        schema={currentAssetSchema}
      />
    </View>
  );
};

export default DefaultCoin;
