import React from 'react';
import { useTheme } from 'react-native-paper';
import { FlatList, StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import SelectOption from 'src/components/SelectOption';

function SettingMenuItem({ SettingsMenu }) {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <FlatList
      style={styles.scrollingWrapper}
      showsVerticalScrollIndicator={false}
      data={SettingsMenu}
      keyExtractor={item => item.title}
      renderItem={({ item }) => (
        <SelectOption
          title={item.title}
          subTitle={item.subtitle}
          icon={item.icon}
          onPress={item.onPress}
        />
      )}
    />
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scrollingWrapper: {
      flex: 1,
    },
  });
export default SettingMenuItem;