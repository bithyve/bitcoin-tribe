import { StyleSheet } from 'react-native';
import React from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import PlusIcon from 'src/assets/images/plus.svg';
import PlusLightIcon from 'src/assets/images/plus_light.svg';
import { useNavigation } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

const styles = StyleSheet.create({});

const RgbChannels = () => {
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  return (
    <ScreenContainer>
      <AppHeader
        title={'Channels'}
        rightIcon={!isThemeDark ? <PlusIcon /> : <PlusLightIcon />}
        onSettingsPress={() =>
          navigation.navigate(NavigationRoutes.OPENRGBCHANNEL)
        }
      />
    </ScreenContainer>
  );
};

export default RgbChannels;
