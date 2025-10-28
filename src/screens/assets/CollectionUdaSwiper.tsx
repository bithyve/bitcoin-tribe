import React from 'react';
import { View, FlatList, Dimensions } from 'react-native';
import UDADetailsScreen from './UDADetailsScreen';
const { width, height } = Dimensions.get('window');

export const CollectionUdaSwiper = ({ route }) => {
  const { assets, index } = route.params;
  return (
    <FlatList
      data={assets}
      horizontal
      pagingEnabled
      initialScrollIndex={index}
      getItemLayout={(_, index) => ({
        length: width,
        offset: width * index,
        index,
      })}
      renderItem={({ item }) => {
        return (
          <View style={{ height, width }} key={item.assetId}>
            <UDADetailsScreen
              data={{
                assetId: item.assetId,
                askReview: false,
                askVerify: false,
              }}
              route={null}
            />
          </View>
        );
      }}
    />
  );
};