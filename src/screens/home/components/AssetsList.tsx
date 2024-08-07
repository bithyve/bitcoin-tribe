import React, { useContext } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp, wp } from 'src/constants/responsive';
import AssetCard from 'src/components/AssetCard';
import AddNewAsset from 'src/assets/images/AddNewAsset.svg';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { Asset, AssetFace } from 'src/models/interfaces/RGBWallet';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useNavigation } from '@react-navigation/native';
import EmptyStateView from 'src/components/EmptyStateView';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import NoAssetsIllustration from 'src/assets/images/noAssets.svg';

type AssetsListProps = {
  listData: Asset[];
  onPressAsset?: () => void;
  onPressAddNew?: () => void;
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
};
const ASSET_HEIGHT = hp(205);
const ASSET_MARGIN = hp(6) * 2;
const ASSET_ALTERNATE_SPACE = hp(50);
const Item = ({
  name,
  image,
  details,
  tag,
  onPressAsset,
  index,
  ticker,
  assetId,
}: ItemProps) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, index), [theme, index]);

  return (
    <View>
      <AssetCard
        image={image}
        name={name}
        details={details}
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
        numColumns={2}
        // style={styles.container}
        data={listData}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {}}
            tintColor={theme.colors.accent1}
          />
        }
        ListFooterComponent={FooterComponent}
        ListEmptyComponent={
          <EmptyStateView
            title={home.noAssetTitle}
            subTitle={home.noAssetSubTitle}
            IllustartionImage={<NoAssetsIllustration />}
          />
        }
        renderItem={({ item, index }) => (
          <View style={styles.assetWrapper}>
            {item.assetIface.toUpperCase() === AssetFace.RGB20 && (
              <Item
                key={index}
                name={item.name}
                details={item.balance.spendable}
                tag="COIN"
                assetId={item.assetId}
                onPressAsset={() =>
                  navigation.navigate(NavigationRoutes.COINDETAILS, {
                    assetId: item.assetId,
                  })
                }
                // onPressAddNew={onPressAddNew}
                index={index}
                ticker={item.ticker}
              />
            )}
            {item.assetIface.toUpperCase() === AssetFace.RGB25 && (
              <Item
                key={index}
                name={item.name}
                details={item.balance.spendable}
                tag="COLLECTIBLE"
                onPressAsset={() =>
                  navigation.navigate(NavigationRoutes.COLLECTIBLEDETAILS, {
                    assetId: item.assetId,
                  })
                }
                // onPressAddNew={onPressAddNew}
                index={index}
                ticker={item.ticker}
                image={`file://${item.media?.filePath}`}
              />
            )}
          </View>
        )}
      />
      <AppTouchable style={styles.addNewIconWrapper} onPress={onPressAddNew}>
        <AddNewAsset />
      </AppTouchable>
    </View>
  );
}
const getStyles = (theme: AppTheme, index = null) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      height: '76%',
    },
    assetWrapper: {
      // height: (ASSET_HEIGHT + ASSET_MARGIN) * 2 + ASSET_ALTERNATE_SPACE,
      // height: '80%',
      flexWrap: 'wrap',
      paddingLeft: wp(15),
    },
    addNewIconWrapper: {
      position: 'absolute',
      bottom: 100,
      right: 30,
    },
    footer: {
      height: 100, // Adjust the height as needed
    },
  });
export default AssetsList;
