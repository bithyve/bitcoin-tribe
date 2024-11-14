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
import AppType from 'src/models/enums/AppType';
import RefreshControlView from 'src/components/RefreshControlView';

type AssetsListProps = {
  listData: Asset[];
  onPressAsset?: () => void;
  onPressAddNew?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
};
type ItemProps = {
  name: string;
  details?: string;
  image?: string;
  tag?: string;
  onPressAddNew?: () => void;
  onPressAsset?: (item: any) => void;
  index?: number;
  ticker?: string;
  assetId?: string;
  amount?: string;
};

const Item = ({
  name,
  image,
  details,
  tag,
  onPressAsset,
  index,
  ticker,
  assetId,
  amount,
}: ItemProps) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, index), [theme, index]);

  return (
    <View style={styles.alternateSpace}>
      <AssetCard
        image={image}
        name={name}
        details={details}
        amount={amount}
        tag={tag}
        onPress={onPressAsset}
        ticker={ticker}
        assetId={assetId}
      />
    </View>
  );
};

function AssetsList(props: AssetsListProps) {
  const { listData, onPressAsset, onPressAddNew } = props;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;

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
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={FooterComponent}
        refreshControl={
          Platform.OS === 'ios' ? (
            <RefreshControlView
              refreshing={props.loading}
              onRefresh={props.onRefresh}
            />
          ) : (
            <RefreshControl
              refreshing={props.loading}
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
        renderItem={({ item, index }) => (
          <View style={styles.assetWrapper}>
            {item.assetIface.toUpperCase() === AssetFace.RGB20 && (
              <Item
                key={index}
                name={item.name}
                details={''}
                amount={item.balance.spendable}
                tag="COIN"
                assetId={item.assetId}
                onPressAsset={() =>
                  navigation.navigate(NavigationRoutes.COINDETAILS, {
                    assetId: item.assetId,
                  })
                }
                index={index}
                ticker={item.ticker}
              />
            )}
            {item.assetIface.toUpperCase() === AssetFace.RGB25 && (
              <Item
                key={index}
                name={item.name}
                details={''}
                amount={item.balance.spendable}
                tag="COLLECTIBLE"
                onPressAsset={() =>
                  navigation.navigate(NavigationRoutes.COLLECTIBLEDETAILS, {
                    assetId: item.assetId,
                  })
                }
                index={index}
                ticker={item.ticker}
                image={Platform.select({
                  android: `file://${item.media?.filePath}`,
                  ios: `${item.media?.filePath}.${
                    item.media?.mime.split('/')[1]
                  }`,
                })}
              />
            )}
          </View>
        )}
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
