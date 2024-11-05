import { StyleSheet } from 'react-native';
import React, { useContext } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import PlusIcon from 'src/assets/images/plus.svg';
import PlusLightIcon from 'src/assets/images/plus_light.svg';
import { useNavigation } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import RGBChannelContainer from './components/RGBChannelContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const styles = StyleSheet.create({});

const RgbChannels = () => {
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { node } = translations;
  return (
    <ScreenContainer>
      <AppHeader
        title={node.channelsTitle}
        rightIcon={!isThemeDark ? <PlusIcon /> : <PlusLightIcon />}
        onSettingsPress={() =>
          navigation.navigate(NavigationRoutes.OPENRGBCHANNEL)
        }
      />
      <RGBChannelContainer />
    </ScreenContainer>
  );
};

export default RgbChannels;
