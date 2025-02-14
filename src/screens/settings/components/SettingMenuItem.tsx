import React from 'react';
import { useTheme } from 'react-native-paper';
import { FlatList, Platform, StyleSheet, View } from 'react-native';

import { AppTheme } from 'src/theme';
import SelectOption from 'src/components/SelectOption';
import SocialLinks from './SocialLinks';
import openLink from 'src/utils/OpenLink';

function SettingMenuItem({ SettingsMenu }) {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const FooterComponent = () => {
    return (
      <View style={styles.footer}>
        <SocialLinks
          onPressTelegram={() => {
            openLink('https://t.me/BitcoinTribeSupport');
          }}
          onPressX={() => {
            openLink('https://x.com/BitcoinTribe_');
          }}
        />
      </View>
    );
  };
  return (
    <FlatList
      style={styles.scrollingWrapper}
      showsVerticalScrollIndicator={false}
      data={SettingsMenu}
      keyExtractor={item => item.id}
      renderItem={({ item }) =>
        !item.hideMenu ? (
          <SelectOption
            title={item.title}
            subTitle={item.subtitle}
            icon={item.icon}
            onPress={item.onPress}
            enableSwitch={item.enableSwitch}
            onValueChange={item.onValueChange}
            toggleValue={item.toggleValue}
            testID={item.testID}
            backup={item.backup}
          />
        ) : null
      }
      ListFooterComponent={FooterComponent}
      contentContainerStyle={styles.contentContainerStyle}
    />
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scrollingWrapper: {},
    footer: {
      paddingVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainerStyle: {
      paddingBottom: Platform.OS === 'android' ? 100 : 50,
    },
  });
export default SettingMenuItem;
