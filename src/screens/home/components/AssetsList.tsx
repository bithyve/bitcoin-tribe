import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp, wp } from 'src/constants/responsive';
import AssetCard from 'src/components/AssetCard';
import AppText from 'src/components/AppText';
import AddNewTile from 'src/components/AddNewTile';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

type AssetsListProps = {
  AssetsData: any;
  onPressAsset?: () => void;
  onPressAddNew?: () => void;
};
type ItemProps = {
  title: string;
  details?: string;
  asset?: any;
  tag?: string;
  onPressAddNew?: () => void;
  onPressAsset?: () => void;
  index?: number;
};
const ASSET_HEIGHT = hp(205);
const ASSET_MARGIN = hp(6) * 2;
const ASSET_ALTERNATE_SPACE = hp(50);
const Item = ({
  asset,
  title,
  details,
  tag,
  onPressAddNew,
  onPressAsset,
  index,
}: ItemProps) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, index), [theme, index]);

  return (
    <View style={styles.alternateSpace}>
      {asset ? (
        <AssetCard
          asset={asset}
          title={title}
          details={details}
          tag={tag}
          onPress={onPressAsset}
        />
      ) : (
        <AddNewTile title={title} onPress={onPressAddNew} />
      )}
    </View>
  );
};

const ListHeaderComponent = () => {
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <AppText variant="pageTitle" style={styles.listHeaderText}>
      {home.myAssets}
    </AppText>
  );
};

function AssetsList(props: AssetsListProps) {
  const { AssetsData, onPressAsset, onPressAddNew } = props;
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
          {AssetsData.map((item, index) => {
            return (
              <Item
                key={index}
                title={item.title}
                asset={item.asset}
                details={item.details}
                tag={item.tag}
                onPressAsset={onPressAsset}
                onPressAddNew={onPressAddNew}
                index={index}
              />
            );
          })}
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
      marginVertical: hp(20),
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
