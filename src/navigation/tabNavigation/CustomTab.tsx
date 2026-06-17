import React, { useContext } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { hp, windowHeight } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import Fonts from 'src/constants/Fonts';
import AssetsActive from 'src/assets/images/icon_assets_active.svg';
import AssetsInActive from 'src/assets/images/icon_assets_inactive.svg';
import AssetsInActiveDark from 'src/assets/images/icon_assets_inactive_dark.svg';
import CollectiblesActive from 'src/assets/images/icon_collectibles_active.svg';
import CollectiblesInActive from 'src/assets/images/icon_collectibles_inactive.svg';
import CollectiblesInActiveLight from 'src/assets/images/icon_collectibles_inactive_light.svg';
import CommunityActive from 'src/assets/images/icon_community_active.svg';
import CommunityInActive from 'src/assets/images/icon_community_inactive.svg';
import CommunityInActiveLight from 'src/assets/images/icon_community_inactive_light.svg';
import SettingsActive from 'src/assets/images/icon_settings_active.svg';
import SettingsInActive from 'src/assets/images/icon_setting_inactive.svg';
import SettingsInActiveLight from 'src/assets/images/icon_setting_inactive_light.svg';
import { NavigationRoutes } from '../NavigationRoutes';
import Capitalize from 'src/utils/capitalizeUtils';
import GradientView from 'src/components/GradientView';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import AppTouchable from 'src/components/AppTouchable';

const CustomTab = ({ state, descriptors, navigation }) => {
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = React.useMemo(() => getStyles(isThemeDark), [isThemeDark]);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const TabBarIcon = (isFocused, label) => {
    switch (label) {
      case NavigationRoutes.HOMESCREEN:
        return isFocused ? (
          <AssetsActive />
        ) : (
          isThemeDark ? (
            <AssetsInActiveDark />
          ) : (
            <AssetsInActive />
          )
        );
      case NavigationRoutes.ASSETS:
        return isFocused ? (
          <CollectiblesActive />
        ) : (
          isThemeDark ? (
            <CollectiblesInActive />
          ) : (
            <CollectiblesInActiveLight />
          )
        );
      case NavigationRoutes.COMMUNITY:
        return isFocused ? (
          <CommunityActive />
        ) : (
          isThemeDark ? (
            <CommunityInActive />
          ) : (
            <CommunityInActiveLight />
          )
        );
      case NavigationRoutes.SETTINGS:
        return isFocused ? (
          <SettingsActive />
        ) : (
          isThemeDark ? (
            <SettingsInActive />
          ) : (
            <SettingsInActiveLight />
          )
        );
      default:
        return '';
    }
  };
  const TabBarTitle = label => {
    switch (label) {
      case NavigationRoutes.HOMESCREEN:
        return `${common.home}`;
      case NavigationRoutes.ASSETS:
        return `${common.assets}`;
      case NavigationRoutes.COMMUNITY:
        return `${common.community}`;
      case NavigationRoutes.SETTINGS:
        return `${common.settings}`;
      default:
        return '';
    }
  };
  return (
    <GradientView
      style={styles.tabBar}
      colors={
        isThemeDark
          ? ['#121212', '#121212', '#121212']
          : ['#FFFFFF', '#FFFFFF', '#FFFFFF']
      }>
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
          <AppTouchable
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
                  marginTop: hp(3),
                  color: isFocused
                    ? '#0166FF'
                    : isThemeDark
                    ? '#575757'
                    : '#667085',
                },
              ]}>
              {Capitalize(TabBarTitle(label))}
            </AppText>
          </AppTouchable>
        );
      })}
    </GradientView>
  );
};

const getStyles = (isThemeDark: boolean) =>
  StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      borderRadius: 28,
      borderColor: isThemeDark ? '#232323' : '#D0D5DD',
      borderWidth: 1,
      position: 'absolute',
      bottom: windowHeight > 670 ? hp(15) : hp(5),
      height: hp(76),
      width: '90%',
      marginBottom: Platform.OS === 'ios' ? hp(15) : hp(35),
      marginHorizontal: hp(14),
      alignSelf: 'center',
    },
    activeTab: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isThemeDark ? '#1E2A42' : '#EAF2FF',
      borderRadius: 20,
      margin: 8,
      minWidth: hp(72),
    },
    inActiveTab: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: hp(50),
    },
    bottomNavigation: {
      fontSize: 10,
      fontFamily: Fonts.LufgaMedium,
      lineHeight: 12 * 1.35,
      fontWeight: '500',
    },
  });

export default CustomTab;
