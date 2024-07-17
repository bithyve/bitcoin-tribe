import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp, windowHeight, wp } from 'src/constants/responsive';
import AssetCard from 'src/components/AssetCard';
import AppText from 'src/components/AppText';
import AddNewTile from 'src/components/AddNewTile';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

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
    <View style={styles.alternateSpace}>
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

const ListHeaderComponent = () => {
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <AppText variant="pageTitle2" style={styles.listHeaderText}>
      {home.myAssets}
    </AppText>
  );
};

function AssetsList(props: AssetsListProps) {
  const { listData, onPressAsset, onPressAddNew } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View>
      <ListHeaderComponent />
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
          <AddNewTile title={'Add New'} onPress={onPressAddNew} />
        </View>
      </ScrollView>
    </View>
  );
}
const getStyles = (theme: AppTheme, index = null) =>
  StyleSheet.create({
    container: {
      marginVertical: hp(10),
    },
    listHeaderText: {
      color: theme.colors.headingColor,
      marginVertical: windowHeight < 650 ? hp(10) : hp(20),
      marginLeft: wp(20),
    },
    assetWrapper: {
      height: (ASSET_HEIGHT + ASSET_MARGIN) * 2 + ASSET_ALTERNATE_SPACE,
      flexWrap: 'wrap',
      paddingLeft: wp(15),
    },
    alternateSpace: {
      marginTop: index % 4 === 2 ? hp(50) : 0,
    },
  });
export default AssetsList;
