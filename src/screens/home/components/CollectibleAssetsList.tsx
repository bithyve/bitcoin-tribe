import React, { useContext } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import AssetCard from 'src/components/AssetCard';
import AddNewAsset from 'src/assets/images/AddNewAsset.svg';
import AddNewAssetLight from 'src/assets/images/AddNewAsset_Light.svg';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { Asset } from 'src/models/interfaces/RGBWallet';
import { useNavigation } from '@react-navigation/native';
import EmptyStateView from 'src/components/EmptyStateView';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import NoAssetsIllustration from 'src/assets/images/noCollectibeAssets.svg';
import NoAssetsIllustrationLight from 'src/assets/images/noCollectibeAssets_light.svg';
import { Keys } from 'src/storage';
import RefreshControlView from 'src/components/RefreshControlView';
import CollectMoreCollectibles from 'src/assets/images/collectMoreCollectibles.svg';
import CollectMoreCollectiblesLight from 'src/assets/images/collectMoreCollectibles_light.svg';
import CollectMoreAssetView from './CollectMoreAssetView';

type AssetsListProps = {
  listData: Asset[];
  onPressAsset?: (asset: Asset) => void;
  onPressAddNew?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  refreshingStatus?: boolean;
};

function CollectibleAssetsList(props: AssetsListProps) {
  const { listData, onPressAsset, onPressAddNew, refreshingStatus } = props;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { home, assets } = translations;

  const FooterComponent = () => {
    return <View style={styles.footer} />;
  };
  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        numColumns={2}
        data={listData}
        extraData={[listData]}
        keyExtractor={item => item.assetId}
        ListFooterComponent={FooterComponent}
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
            title={home.noCollectibleAssetTitle}
            subTitle={home.noCollectibleAssetSubTitle}
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
            <View style={styles.assetWrapper}>
              <View
                style={
                  index % 2 === 0
                    ? styles.alternateSpaceEven
                    : styles.alternateSpaceOdd
                }>
                <AssetCard
                  asset={item}
                  tag={'COLLECTIBLE'}
                  onPress={() => onPressAsset(item)}
                  precision={item.precision}
                />
              </View>
            </View>
          );
        }}
      />
      {listData.length === 1 && (
        <CollectMoreAssetView
          icon={
            isThemeDark ? (
              <CollectMoreCollectibles />
            ) : (
              <CollectMoreCollectiblesLight />
            )
          }
          title={assets.collectMoreCollectibleTitle}
          subTitle={assets.collectMoreCollectibleSubTitle}
        />
      )}
      <AppTouchable
        style={
          isThemeDark ? styles.addNewIconWrapper : styles.addNewIconWrapperLight
        }
        onPress={onPressAddNew}>
        {isThemeDark ? <AddNewAsset /> : <AddNewAssetLight />}
      </AppTouchable>
    </View>
  );
}
const getStyles = (theme: AppTheme, index = null) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    assetWrapper: {
      flexWrap: 'wrap',
    },
    addNewIconWrapper: {
      position: 'absolute',
      bottom: Platform.select({
        ios: hp(50),
        android: hp(70),
      }),
      right: wp(20),
    },
    addNewIconWrapperLight: {
      position: 'absolute',
      bottom: 30,
      right: 0,
    },
    footer: {
      height: windowHeight > 670 ? 200 : 100,
    },
    emptyStateWrapper: {
      marginTop: '38%',
    },
    alternateSpaceEven: {
      top: 0,
    },
    alternateSpaceOdd: {
      top: hp(50),
    },
  });
export default CollectibleAssetsList;
