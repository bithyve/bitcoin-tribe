import React from 'react';
import { View, FlatList, Dimensions } from 'react-native';
import UDADetailsScreen from './UDADetailsScreen';
import AppHeader from 'src/components/AppHeader';
import { wp } from 'src/constants/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');

export const CollectionUdaSwiper = ({ route }) => {
  const { assets, index } = route.params;
  const insets = useSafeAreaInsets();
  return (
    <>
      <AppHeader
        title={''}
        style={{
          position: 'absolute',
          left: wp(16),
          right: wp(16),
          top: insets.top * 0.8,
          zIndex: 100,
        }}
      />
      <FlatList
        data={assets}
        horizontal
        pagingEnabled
        initialScrollIndex={index}
        showsHorizontalScrollIndicator={false}
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
                  showHeader: false,
                }}
                route={null}
              />
            </View>
          );
        }}
      />
    </>
  );
};
