import { FlatList, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useMemo } from 'react';
import { useQuery } from '@realm/react';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import PlusIcon from 'src/assets/images/plus.svg';
import PlusLightIcon from 'src/assets/images/plus_light.svg';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { ApiHandler } from 'src/services/handler/apiHandler';
import ChannelItem from './ChannelItem';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import { Asset, Coin } from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import EmptyChannelsStateView from './components/EmptyChannelsStateView';

const styles = StyleSheet.create({
  loadingWrapper: {
    height: '76%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshLoader: {
    alignSelf: 'center',
    width: 100,
    height: 100,
  },
});

const RgbChannels = () => {
  const navigation = useNavigation();
  const { mutate, isLoading, error, data } = useMutation(
    ApiHandler.getChannels,
  );
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { node } = translations;

  const coins = useQuery<Coin[]>(RealmSchema.Coin);
  const collectibles = useQuery<Coin[]>(RealmSchema.Collectible);
  const assetsData: Asset[] = useMemo(() => {
    const combined: Asset[] = [...coins.toJSON(), ...collectibles.toJSON()];
    return combined.sort((a, b) => a.timestamp - b.timestamp);
  }, [coins, collectibles]);

  function findNameByAssetId(assetId) {
    const asset = assetsData.find(item => item.assetId === assetId);
    return asset ? asset.name : null;
  }
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      mutate();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <ScreenContainer>
      <AppHeader
        title={`${node.channelsTitle}  ${
          data && data?.length ? `(${data?.length})` : ''
        }`}
        rightIcon={
          data && data.length ? (
            isThemeDark ? (
              <PlusIcon />
            ) : (
              <PlusLightIcon />
            )
          ) : null
        }
        onSettingsPress={() =>
          navigation.navigate(NavigationRoutes.OPENRGBCHANNEL)
        }
      />
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <LottieView
            source={require('src/assets/images/jsons/loader.json')}
            autoPlay
            loop
            style={styles.refreshLoader}
          />
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ChannelItem
              name={findNameByAssetId(item.assetId)}
              inbound={item.assetRemoteAmount}
              outbound={item.assetLocalAmount}
              channel={item}
              localBalanceMsat={item.localBalanceMsat}
              capacitySat={item.capacitySat}
            />
          )}
          ListEmptyComponent={
            <EmptyChannelsStateView
              onPress={() =>
                navigation.navigate(NavigationRoutes.OPENRGBCHANNEL)
              }
            />
          }
        />
      )}
    </ScreenContainer>
  );
};

export default RgbChannels;
