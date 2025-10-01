import React, { useContext } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useQuery } from '@realm/react';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import AddNewAsset from 'src/assets/images/AddNewAsset.svg';
import AddNewAssetLight from 'src/assets/images/AddNewAsset_Light.svg';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { Asset } from 'src/models/interfaces/RGBWallet';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import EmptyStateView from 'src/components/EmptyStateView';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import NoAssetsIllustration from 'src/assets/images/noCoinAssets.svg';
import NoAssetsIllustrationLight from 'src/assets/images/noCoinAssets_light.svg';
import { Keys } from 'src/storage';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import RefreshControlView from 'src/components/RefreshControlView';
import CoinAssetCard from 'src/components/CoinAssetCard';
import CollectMoreCoins from 'src/assets/images/collectMoreCoins.svg';
import CollectMoreCoinsLight from 'src/assets/images/collectMoreCoins_light.svg';
import CollectMoreAssetView from './CollectMoreAssetView';
import Colors from 'src/theme/Colors';

type AssetsListProps = {
  listData: Asset[];
  onPressAsset?: () => void;
  onPressAddNew?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  refreshingStatus?: boolean;
};

function CoinAssetsList(props: AssetsListProps) {
  const { listData, onPressAsset, onPressAddNew, loading, refreshingStatus } =
    props;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { home, assets } = translations;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  const FooterComponent = () => {
    return <View style={styles.footer} />;
  };
  return (
    <View style={styles.container}>
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
            title={home.noCoinAssetTitle}
            subTitle={home.noCoinAssetSubTitle}
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
          const navigateTo = NavigationRoutes.COINDETAILS;
          const styles = getStyles(theme, index);

          return (
            <View style={styles.assetWrapper}>
              <CoinAssetCard
                asset={item}
                tag={'COIN'}
                onPress={() =>
                  navigation.navigate(navigateTo, { assetId: item.assetId })
                }
              />
            </View>
          );
        }}
      />
      {listData.length === 1 && (
        <CollectMoreAssetView
          icon={isThemeDark ? <CollectMoreCoins /> : <CollectMoreCoinsLight />}
          title={assets.collectMoreCoinTitle}
          subTitle={assets.collectMoreCoinSubTitle}
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
      position: 'relative',
      marginTop: hp(10),
      flex: 1,
      paddingHorizontal: hp(10),
    },
    assetWrapper: {
      flex: 1,
      marginVertical: hp(5),
    },
    addNewIconWrapper: {
      position: 'absolute',
      bottom: Platform.select({
        ios: hp(90),
        android: hp(110),
      }),
      right: wp(20),
    },
    addNewIconWrapperLight: {
      position: 'absolute',
      bottom: Platform.select({
        ios: hp(90),
        android: hp(70),
      }),
      right: wp(20),
      shadowColor: Colors.Black,
      shadowOffset: { width: 8, height: 15 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    footer: {
      height: windowHeight > 670 ? 200 : 100,
    },
    emptyStateWrapper: {
      marginTop: '38%',
    },
  });
export default CoinAssetsList;
