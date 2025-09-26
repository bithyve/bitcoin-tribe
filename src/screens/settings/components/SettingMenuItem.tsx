import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { AppTheme } from 'src/theme';
import SocialLinks from './SocialLinks';
import openLink from 'src/utils/OpenLink';
import SettingSectionList from './SettingSectionList';
import { SettingMenuProps } from 'src/models/interfaces/Settings';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';

type SettingMenuItemProps = {
  WalletMgtMenu: SettingMenuProps[];
  PersonalizationMenu: SettingMenuProps[];
  AppSecurityMenu: SettingMenuProps[];
  SettingsMenu: SettingMenuProps[];
  AdvancedMenu: SettingMenuProps[];
};

function SettingMenuItem({
  WalletMgtMenu,
  PersonalizationMenu,
  AppSecurityMenu,
  SettingsMenu,
  AdvancedMenu,
}: SettingMenuItemProps) {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
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
      contentContainerStyle={styles.content}
      style={styles.scrollingWrapper}>
      <SettingSectionList
        data={PersonalizationMenu}
        sectionTitle={settings.personalizationTitle}
      />
      <SettingSectionList
        data={AppSecurityMenu}
        sectionTitle={settings.appSecurityTitle}
      />
      <SettingSectionList
        data={WalletMgtMenu}
        sectionTitle={settings.walletMgtTitle}
      />

      <SettingSectionList
        data={SettingsMenu}
        sectionTitle={settings.AboutSupportTitle}
      />

      <SettingSectionList
        data={AdvancedMenu}
        sectionTitle={'Advanced Options'}
        isDanger
      />

      <FooterComponent />
    </ScrollView>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scrollingWrapper: {
      height: Platform.OS === 'android' ? '90%' : '92%',
    },
    footer: {
      paddingBottom: Platform.OS === 'android' ? hp(35) : hp(20),
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: hp(10),
    },
    contentContainerStyle: {
      paddingBottom: Platform.OS === 'android' ? 120 : 50,
    },
    content: {
      paddingBottom: 100,
    },
  });
export default SettingMenuItem;
