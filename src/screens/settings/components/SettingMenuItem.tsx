import React from 'react';
import { useTheme } from 'react-native-paper';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppTheme } from 'src/theme';
import SelectOption from 'src/components/SelectOption';
import { windowHeight } from 'src/constants/responsive';

function SettingMenuItem({ SettingsMenu }) {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const FooterComponent = () => {
    return <View style={styles.footer} />;
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
    />
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scrollingWrapper: {
      flex: 1,
    },
    footer: {
      height: windowHeight > 670 ? 80 : 40, // Adjust the height as needed
    },
  });
export default SettingMenuItem;
