import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp, wp } from 'src/constants/responsive';
import AssetCard from 'src/components/AssetCard';
import AddNewAsset from 'src/assets/images/AddNewAsset.svg';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';

type AssetsListProps = {
  listData: any;
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
      />
    </View>
  );
};

function AssetsList(props: AssetsListProps) {
  const { listData, onPressAsset, onPressAddNew } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        directionalLockEnabled={true}
        alwaysBounceVertical={false}>
        <View style={styles.assetWrapper}>
          {listData.map((item, index) => {
            return (
              <Item
                key={index}
                name={item.name}
                details={item.balance.spendable}
                tag="COIN"
                onPressAsset={() => onPressAsset(item)}
                onPressAddNew={onPressAddNew}
                index={index}
                ticker={item.ticker}
              />
            );
          })}
          {/* <AddNewTile title={'Add New'} onPress={onPressAddNew} /> */}
        </View>
      </ScrollView>
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
    },
    assetWrapper: {
      height: (ASSET_HEIGHT + ASSET_MARGIN) * 2 + ASSET_ALTERNATE_SPACE,
      flexWrap: 'wrap',
      paddingLeft: wp(15),
    },
    addNewIconWrapper: {
      position: 'absolute',
      bottom: 50,
      right: 30,
    },
  });
export default AssetsList;
