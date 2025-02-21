import React from 'react';
import { useTheme } from 'react-native-paper';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppTheme } from 'src/theme';
import SocialLinks from './SocialLinks';
import openLink from 'src/utils/OpenLink';
import SettingSectionList from './SettingSectionList';
import { SettingMenuProps } from 'src/models/interfaces/Settings';

type SettingMenuItemProps = {
  WalletMgtMenu: SettingMenuProps[];
  PersonalizationMenu: SettingMenuProps[];
  AppSecurityMenu: SettingMenuProps[];
  SettingsMenu: SettingMenuProps[];
};

function SettingMenuItem({
  WalletMgtMenu,
  PersonalizationMenu,
  AppSecurityMenu,
  SettingsMenu,
}: SettingMenuItemProps) {
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
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.scrollingWrapper}>
      <SettingSectionList
        data={WalletMgtMenu}
        sectionTitle={'Wallet Management'}
      />
      <SettingSectionList
        data={PersonalizationMenu}
        sectionTitle={'Personalization'}
      />
      <SettingSectionList
        data={AppSecurityMenu}
        sectionTitle={'App Security'}
      />
      <SettingSectionList
        data={SettingsMenu}
        sectionTitle={'About & Support'}
      />

      <FooterComponent />
    </ScrollView>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scrollingWrapper: {
      height: '92%',
    },
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
