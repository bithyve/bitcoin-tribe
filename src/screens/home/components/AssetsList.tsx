import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp } from 'src/constants/responsive';
import AssetCard from 'src/components/AssetCard';
import AppText from 'src/components/AppText';
import AddNewTile from 'src/components/AddNewTile';

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
  onPressAsset?: () => void;
  onPressAddNew?: () => void;
};
const Item = ({
  asset,
  title,
  details,
  tag,
  onPressAddNew,
  onPressAsset,
}: ItemProps) => {
  return (
    <View>
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
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <AppText variant="pageTitle" style={styles.listHeaderText}>
      My Assets
    </AppText>
  );
};

const ListFooterComponent = () => {
  return <AddNewTile title="Add New" />;
};

function AssetsList(props: AssetsListProps) {
  const { AssetsData, onPressAsset, onPressAddNew } = props;
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View>
      <ListHeaderComponent />
      <FlatList
        //   ListHeaderComponent={ListHeaderComponent}
        //   ListFooterComponent={ListFooterComponent}
        style={styles.container}
        numColumns={2}
        data={AssetsData}
        renderItem={({ item }) => (
          <Item
            title={item.title}
            asset={item.asset}
            details={item.details}
            tag={item.tag}
            onPressAsset={onPressAsset}
            onPressAddNew={onPressAddNew}
          />
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        //   ItemSeparatorComponent={() => <View style={{ margin: 5 }} />}
        //   stickyHeaderIndices={[0, 6, 13]}
      />
    </View>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    container: {
      marginVertical: hp(5),
      maxHeight: '82%',
      flexGrow: 0,
    },
    listHeaderText: {
      color: theme.colors.headingColor,
      marginTop: hp(25),
    },
  });
export default AssetsList;
