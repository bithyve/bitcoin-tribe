import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';

import { wp, hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import CommonStyles from 'src/common/styles/CommonStyles';

import TextIcon from 'src/assets/images/icon_bitcoin.svg';
import AssetsActive from 'src/assets/images/icon_addnew.svg';
import CommunityActive from 'src/assets/images/icon_community_active.svg';
import SettingsActive from 'src/assets/images/icon_settings_active.svg';
import { NavigationRoutes } from '../NavigationRoutes';

const windowWidth = Dimensions.get('window').width;

const CustomTab = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const TabBarIcon = (isFocused, label) => {
    switch (label) {
      case NavigationRoutes.ASSETS:
        return isFocused ? <AssetsActive /> : <TextIcon />;
      case NavigationRoutes.COMMUNITY:
        return isFocused ? <CommunityActive /> : <TextIcon />;
      case NavigationRoutes.SETTINGS:
        return isFocused ? <SettingsActive /> : <TextIcon />;
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
            style={styles.tab}>
            <View>{TabBarIcon(isFocused, label)}</View>
            {isFocused && (
              <AppText
                style={[
                  CommonStyles.bottomNavigation,
                  { color: isFocused ? theme.colors.primaryCTA : 'gray' },
                ]}>
                &nbsp;{label}
              </AppText>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      borderRadius: 20,
      backgroundColor: theme.colors.inputBackground,
      position: 'absolute',
      bottom: 0,
      height: hp(62),
      width: wp(295),
      marginBottom: hp(15),
      marginHorizontal: windowWidth * 0.1,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default CustomTab;
