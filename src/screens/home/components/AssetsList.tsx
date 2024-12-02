import React, { useContext } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import AssetCard from 'src/components/AssetCard';
import AddNewAsset from 'src/assets/images/AddNewAsset.svg';
import AddNewAssetLight from 'src/assets/images/AddNewAsset_Light.svg';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { Asset, AssetFace } from 'src/models/interfaces/RGBWallet';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useNavigation } from '@react-navigation/native';
import EmptyStateView from 'src/components/EmptyStateView';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import NoAssetsIllustration from 'src/assets/images/noAssets.svg';
import NoAssetsIllustrationLight from 'src/assets/images/noAssets_light.svg';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { useQuery } from '@realm/react';
import RefreshControlView from 'src/components/RefreshControlView';
import LoadingSpinner from 'src/components/LoadingSpinner';

type AssetsListProps = {
  listData: Asset[];
  onPressAsset?: () => void;
  onPressAddNew?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  refreshingStatus?: boolean;
};

function AssetsList(props: AssetsListProps) {
  const { listData, onPressAsset, onPressAddNew, refreshingStatus } = props;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const FooterComponent = () => {
    return <View style={styles.footer} />;
  };
  return (
    <View style={styles.container}>
      {props.loading && !refreshingStatus ? (
        <LoadingSpinner/>
      ) : null}
      <FlatList
        showsVerticalScrollIndicator={false}
        numColumns={2}
        data={listData}
        extraData={[listData]}
        keyExtractor={(item, index) => index.toString()}
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
              colors={[theme.colors.accent1]} // You can customize this part
              progressBackgroundColor={theme.colors.inputBackground}
            />
          )
        }
        ListEmptyComponent={
          <EmptyStateView
            title={home.noAssetTitle}
            subTitle={home.noAssetSubTitle}
            IllustartionImage={
              !isThemeDark ? (
                <NoAssetsIllustration />
              ) : (
                <NoAssetsIllustrationLight />
              )
            }
          />
        }
        renderItem={({ item, index }) => {
          const isCoin = item.assetIface.toUpperCase() === AssetFace.RGB20;
          const navigateTo = isCoin
            ? NavigationRoutes.COINDETAILS
            : NavigationRoutes.COLLECTIBLEDETAILS;
          const styles = getStyles(theme, index);

          return (
            <View style={styles.assetWrapper}>
              <View style={styles.alternateSpace}>
                <AssetCard
                  name={item.name}
                  image={Platform.select({
                    android: `file://${item.media?.filePath}`,
                    ios: item.media?.filePath,
                  })}
                  details={item.details}
                  amount={
                    item.balance.spendable + item.balance.offchainOutbound
                  }
                  tag={isCoin ? 'COIN' : 'COLLECTIBLE'}
                  onPress={() =>
                    navigation.navigate(navigateTo, { assetId: item.assetId })
                  }
                  ticker={item.ticker}
                  assetId={item.assetId}
                  assetIface={item.assetIface.toUpperCase()}
                />
              </View>
            </View>
          );
        }}
      />
      <AppTouchable
        style={
          !isThemeDark
            ? styles.addNewIconWrapper
            : styles.addNewIconWrapperLight
        }
        onPress={onPressAddNew}>
        {!isThemeDark ? <AddNewAsset /> : <AddNewAssetLight />}
      </AppTouchable>
    </View>
  );
}
const getStyles = (theme: AppTheme, index = null) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      height: '80%',
      marginHorizontal: wp(10),
    },
    assetWrapper: {
      flexWrap: 'wrap',
    },
    addNewIconWrapper: {
      position: 'absolute',
      bottom: 90,
      right: 30,
    },
    addNewIconWrapperLight: {
      position: 'absolute',
      bottom: 40,
      right: 0,
    },
    footer: {
      height: windowHeight > 670 ? 200 : 100, // Adjust the height as needed
    },
    alternateSpace: {
      top: index % 2 === 0 ? 0 : hp(50),
    },
  });
export default AssetsList;
