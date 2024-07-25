import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import { wp, hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import Fonts from 'src/constants/Fonts';
import TextIcon from 'src/assets/images/icon_bitcoin.svg';

import AssetsActive from 'src/assets/images/icon_assets_active.svg';
// import AssetsInActive from 'src/assets/images/icon_assets_inactive.svg';
import CommunityActive from 'src/assets/images/icon_community_active.svg';
import CommunityInActive from 'src/assets/images/icon_community_inactive.svg';
import SettingsActive from 'src/assets/images/icon_settings_active.svg';
// import SettingsInActive from 'src/assets/images/icon_settings_inactive.svg';
import { NavigationRoutes } from '../NavigationRoutes';
import { AppTheme } from 'src/theme';
import Capitalize from 'src/utils/capitalizeUtils';

const windowWidth = Dimensions.get('window').width;

const CustomTab = ({ state, descriptors, navigation }) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const TabBarIcon = (isFocused, label) => {
    switch (label) {
      case NavigationRoutes.ASSETS:
        return isFocused && <AssetsActive />;
      case NavigationRoutes.COMMUNITY:
        return isFocused ? <CommunityActive /> : <CommunityInActive />;
      case NavigationRoutes.SETTINGS:
        return isFocused && <SettingsActive />;
      default:
        return <TextIcon />;
    }
  };

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={isFocused ? styles.activeTab : styles.inActiveTab}>
            <View>{TabBarIcon(isFocused, label)}</View>
            <AppText
              style={[
                styles.bottomNavigation,
                {
                  color: isFocused
                    ? theme.colors.primaryCTAText
                    : theme.colors.disablePrimaryCTAText,
                },
              ]}>
              &nbsp;&nbsp;{Capitalize(label)}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      borderRadius: 40,
      backgroundColor: theme.colors.inputBackground,
      position: 'absolute',
      bottom: hp(15),
      height: hp(68),
      width: wp(295),
      marginBottom: hp(15),
      marginHorizontal: windowWidth * 0.1,
      // paddingHorizontal: wp(30),
    },
    activeTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF',
      borderRadius: 20,
      margin: 10,
    },
    inActiveTab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomNavigation: {
      fontSize: 14,
      fontFamily: Fonts.LufgaSemiBold,
      lineHeight: 14 * 1.4,
      fontWeight: '400',
      // height: 15,
    },
  });

export default CustomTab;
