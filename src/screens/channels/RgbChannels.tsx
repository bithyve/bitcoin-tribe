import { FlatList, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import PlusIcon from 'src/assets/images/plus.svg';
import PlusLightIcon from 'src/assets/images/plus_light.svg';
import { useNavigation } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import LottieView from 'lottie-react-native';
import ChannelItem from './ChannelItem';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import RGBChannelIllustration from 'src/assets/images/RGBChannelIllustration.svg';
import EmptyStateView from 'src/components/EmptyStateView';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      mutate();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <ScreenContainer>
      <AppHeader
        title={`${node.channelsTitle}  ${data ? `(${data.length})` : ''}`}
        rightIcon={!isThemeDark ? <PlusIcon /> : <PlusLightIcon />}
        onSettingsPress={() =>
          navigation.navigate(NavigationRoutes.OPENRGBCHANNEL)
        }
      />
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <LottieView
            source={require('src/assets/images/loader.json')}
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
              name={item.assetId}
              inbound={item.assetRemoteAmount}
              outbound={item.assetLocalAmount}
              channel={item}
            />
          )}
          ListEmptyComponent={
            <EmptyStateView
              IllustartionImage={<RGBChannelIllustration />}
              title={node.channelEmptyTitle}
              subTitle={node.channelEmptySubTitle}
            />
          }
        />
      )}
    </ScreenContainer>
  );
};

export default RgbChannels;
