import React, { useContext } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import { wp, hp, windowHeight } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import Fonts from 'src/constants/Fonts';

import AssetsActive from 'src/assets/images/icon_assets_active.svg';
import AssetsActiveLight from 'src/assets/images/icon_assets_active_light.svg';
import AssetsInActive from 'src/assets/images/icon_assets_inactive.svg';
import CommunityActive from 'src/assets/images/icon_community_active.svg';
import CommunityActiveLight from 'src/assets/images/icon_community_active_light.svg';
import CommunityInActive from 'src/assets/images/icon_community_inactive.svg';
import SettingsActive from 'src/assets/images/icon_settings_active.svg';
import SettingsActiveLight from 'src/assets/images/icon_settings_active_light.svg';
import SettingsInActive from 'src/assets/images/icon_setting_inactive.svg';
import { NavigationRoutes } from '../NavigationRoutes';
import { AppTheme } from 'src/theme';
import Capitalize from 'src/utils/capitalizeUtils';
import GradientView from 'src/components/GradientView';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

const windowWidth = Dimensions.get('window').width;

const CustomTab = ({ state, descriptors, navigation }) => {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const TabBarIcon = (isFocused, label) => {
    switch (label) {
      case NavigationRoutes.ASSETS:
        return isFocused ? (
          isThemeDark ? (
            <AssetsActive />
          ) : (
            <AssetsActiveLight />
          )
        ) : (
          <AssetsInActive />
        );
      case NavigationRoutes.COMMUNITY:
        return isFocused ? (
          isThemeDark ? (
            <CommunityActive />
          ) : (
            <CommunityActiveLight />
          )
        ) : (
          <CommunityInActive />
        );
      case NavigationRoutes.SETTINGS:
        return isFocused ? (
          isThemeDark ? (
            <SettingsActive />
          ) : (
            <SettingsActiveLight />
          )
        ) : (
          <SettingsInActive />
        );
      default:
        return '';
    }
  };
  const TabBarTitle = (isFocused, label) => {
    switch (label) {
      case NavigationRoutes.ASSETS:
        return isFocused ? `${common.assets}` : '';
      case NavigationRoutes.COMMUNITY:
        return isFocused ? `${common.community}` : '';
      case NavigationRoutes.SETTINGS:
        return isFocused ? `${common.settings}` : '';
      default:
        return '';
    }
  };
  return (
    <GradientView
      style={styles.tabBar}
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
      ]}>
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
              &nbsp;&nbsp;{Capitalize(TabBarTitle(isFocused, label))}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </GradientView>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      borderRadius: 40,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      position: 'absolute',
      bottom: windowHeight > 670 ? hp(15) : hp(5),
      height: hp(68),
      width: '89%',
      marginBottom: Platform.OS === 'ios' ? hp(15) : hp(30),
      marginHorizontal: hp(16),
      // alignSelf: 'center',
      // marginHorizontal: windowWidth * 0.1,
    },
    activeTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.activeTabColor,
      borderRadius: 100,
      margin: 10,
      paddingHorizontal: hp(15),
    },
    inActiveTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomNavigation: {
      fontSize: 13,
      fontFamily: Fonts.LufgaSemiBold,
      lineHeight: 13 * 1.4,
      fontWeight: '400',
    },
  });

export default CustomTab;
