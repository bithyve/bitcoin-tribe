import { StyleSheet, View } from 'react-native';
import React from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import PlusIcon from 'src/assets/images/plus.svg';
import { useNavigation } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

const styles = StyleSheet.create({});

const RgbChannels = () => {
  const navigation = useNavigation();
  return (
    <ScreenContainer>
      <AppHeader
        title={'Channels'}
        rightIcon={<PlusIcon />}
        onSettingsPress={() =>
          navigation.navigate(NavigationRoutes.OPENRGBCHANNEL)
        }
      />
    </ScreenContainer>
  );
};

export default RgbChannels;
