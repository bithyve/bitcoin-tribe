import React, { useContext } from 'react';
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import EmptyStateView from 'src/components/EmptyStateView';
import RefreshControlView from 'src/components/RefreshControlView';
import { hp, windowHeight } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import {
  Asset,
  AssetSchema,
  AssetVisibility,
} from 'src/models/interfaces/RGBWallet';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';
import NoAssetsIllustration from 'src/assets/images/noAssets.svg';
import NoAssetsIllustrationLight from 'src/assets/images/noAssets_light.svg';
import GradientView from 'src/components/GradientView';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import AssetIcon from 'src/components/AssetIcon';

type HiddenAssetsListProps = {
  listData: Asset[];
  onRefresh?: () => void;
  loading?: boolean;
  refreshingStatus?: boolean;
};

function HiddenAssetsList(props: HiddenAssetsListProps) {
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { listData, refreshingStatus } = props;
  const { translations } = useContext(LocalizationContext);
  const { common, home, settings, assets } = translations;
  const styles = getStyles(theme);

  const FooterComponent = () => {
    return <View style={styles.footer} />;
  };

  const getAssetType = (assetSchema: string) => {
    switch (assetSchema.toUpperCase()) {
      case AssetSchema.Collectible:
        return assets.collectible;
      case AssetSchema.Coin:
        return assets.coin;
      case AssetSchema.UDA:
        return assets.collectible;
      default:
        return '';
    }
  };

  const unHideAsset = (assetId, assetSchema) => {
    let schemaType;
    switch (assetSchema.toUpperCase()) {
      case AssetSchema.Collectible:
        schemaType = RealmSchema.Collectible;
        break;
      case AssetSchema.Coin:
        schemaType = RealmSchema.Coin;
        break;
      case AssetSchema.UDA:
        schemaType = RealmSchema.UniqueDigitalAsset;
        break;
      default:
        return;
    }
    dbManager.updateObjectByPrimaryId(schemaType, 'assetId', assetId, {
      visibility: AssetVisibility.DEFAULT,
    });
  };

  return (
    <View>
      <FlatList
        data={listData}
        extraData={[listData]}
        keyExtractor={item => item.assetId}
        ListFooterComponent={FooterComponent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          Platform.OS === 'ios' ? (
            <RefreshControlView
              refreshing={refreshingStatus}
              onRefresh={props.onRefresh}
            />
          ) : (
            <RefreshControl
              refreshing={refreshingStatus}
              onRefresh={props.onRefresh}
              colors={[theme.colors.accent1]}
              progressBackgroundColor={theme.colors.inputBackground}
            />
          )
        }
        ListEmptyComponent={
          <EmptyStateView
            title={assets.noHiddenAssetTitle}
            subTitle={assets.noHiddenAssetSubTitle}
            IllustartionImage={
              isThemeDark ? (
                <NoAssetsIllustration />
              ) : (
                <NoAssetsIllustrationLight />
              )
            }
            style={styles.emptyStateWrapper}
          />
        }
        renderItem={({ item, index }) => {
          return (
            <GradientView
              style={styles.container}
              colors={[
                theme.colors.cardGradient1,
                theme.colors.cardGradient2,
                theme.colors.cardGradient3,
              ]}>
              <View style={styles.assetImageWrapper}>
                {item?.assetSchema.toUpperCase() === AssetSchema.Coin ? (
                  <AssetIcon
                    iconUrl={item.iconUrl}
                    assetTicker={item.ticker}
                    assetID={item.assetId}
                    size={30}
                    verified={item?.issuer?.verified}
                  />
                ) : (
                  <Image
                    source={{
                      uri:
                        item?.assetSchema.toUpperCase() === AssetSchema.UDA
                          ? Platform.select({
                              android: `file://${item?.token?.media?.filePath}`,
                              ios: item?.token?.media?.filePath,
                            })
                          : Platform.select({
                              android: `file://${item?.media?.filePath}`,
                              ios: item?.media?.filePath,
                            }),
                    }}
                    style={styles.imageStyle}
                  />
                )}
              </View>
              <View style={styles.assetDetailsContainer}>
                <AppText variant="body2" style={styles.assetName}>
                  {item.name}
                </AppText>
                <View style={styles.assetDetailsWrapper}>
                  <AppText variant="body2" style={styles.assetTypeText}>
                    {getAssetType(item.assetSchema)}
                  </AppText>
                  <View style={styles.verticalLineStyle} />
                  <AppText variant="body2" style={styles.assetBalance}>
                    {item.precision === 0
                      ? numberWithCommas(item?.balance?.future)
                      : numberWithCommas(
                          Number(item?.balance?.future) / 10 ** item.precision,
                        )}
                  </AppText>
                </View>
              </View>

              <View style={styles.hiddenCtaWrapper}>
                <AppTouchable
                  style={styles.hiddenCta}
                  onPress={() => unHideAsset(item.assetId, item.assetSchema)}>
                  <AppText variant="caption" style={styles.hiddenCtaTitle}>
                    {settings.unHide}
                  </AppText>
                </AppTouchable>
              </View>
            </GradientView>
          );
        }}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      marginVertical: hp(10),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: 10,
      padding: hp(15),
    },
    assetImageWrapper: {
      width: '15%',
    },
    assetDetailsContainer: {
      width: '65%',
    },
    hiddenCtaWrapper: {
      width: '20%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    hiddenCta: {
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.colors.accent1,
      borderWidth: 1.5,
      paddingVertical: hp(5),
      paddingHorizontal: hp(8),
      borderRadius: 15,
      backgroundColor: theme.colors.hideAssetCTABackColor,
    },
    hiddenCtaTitle: {
      color: theme.colors.accent1,
      fontWeight: 'bold',
    },
    assetName: {
      color: theme.colors.headingColor,
    },
    assetDetailsWrapper: {
      flexDirection: 'row',
    },
    assetTypeText: {
      color: theme.colors.secondaryHeadingColor,
    },
    verticalLineStyle: {
      alignSelf: 'center',
      height: '85%',
      width: 1,
      backgroundColor: theme.colors.hideAssetDeviderColor,
      marginHorizontal: hp(5),
    },
    assetBalance: {
      color: theme.colors.accent1,
    },
    imageStyle: {
      width: hp(30),
      height: hp(30),
      borderRadius: 15,
    },
    footer: {
      height: windowHeight > 670 ? 200 : 100,
    },
    emptyStateWrapper: {},
  });
export default HiddenAssetsList;
