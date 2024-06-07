import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import CommonStyles from '../../common/styles/CommonStyles';
import { wp, hp } from '../../constants/responsive';

import TextIcon from '../../assets/images/icon_bitcoin.svg';
import AssetsActive from '../../assets/images/icon_addnew.svg';
import CommunityActive from '../../assets/images/icon_community_active.svg';
import SettingsActive from '../../assets/images/icon_settings_active.svg';

const windowWidth = Dimensions.get('window').width;

const CustomTab = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const TabBarIcon = (isFocused, label) => {
    switch (label) {
      case 'Assets':
        return isFocused ? <AssetsActive /> : <TextIcon />;
      case 'Community':
        return isFocused ? <CommunityActive /> : <TextIcon />;
      case 'Settings':
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
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}>
            <View>{TabBarIcon(isFocused, label)}</View>
            {isFocused && (
              <Text
                style={[
                  CommonStyles.bottomNavigation,
                  { color: isFocused ? theme.colors.primaryCTA : 'gray' },
                ]}>
                &nbsp;{label}
              </Text>
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
