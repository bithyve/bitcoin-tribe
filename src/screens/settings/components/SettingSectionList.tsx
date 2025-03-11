import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import SelectMenuItem from './SelectMenuItem';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { SettingMenuProps } from 'src/models/interfaces/Settings';

interface sectionListProps {
  data: SettingMenuProps[];
  sectionTitle: string;
}

function SettingSectionList(props: sectionListProps) {
  const { data, sectionTitle } = props;
  const filteredData = data.filter(
    item => item.hideMenu !== false || !item.hideMenu,
  );
  const lastIndex = filteredData.length - 1;

  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <AppText variant="body1" style={styles.headerText}>
          {sectionTitle}
        </AppText>
      </View>
      <View>
        {data.map((item, index) => {
          return !item.hideMenu ? (
            <SelectMenuItem
              title={item.title}
              subTitle={item.subtitle}
              icon={item.icon}
              onPress={item.onPress}
              enableSwitch={item.enableSwitch}
              onValueChange={item.onValueChange}
              toggleValue={item.toggleValue}
              testID={item.testID}
              backup={item.backup}
              lastIndex={lastIndex === index}
              manualAssetBackupStatus={item.manualAssetBackupStatus}
            />
          ) : null;
        })}
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.cardGradient3,
      borderRadius: 16,
      marginVertical: hp(10),
    },
    headerSection: {
      height: hp(50),
      justifyContent: 'center',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: theme.colors.settingMenuHeader,
    },
    headerText: {
      color: theme.colors.secondaryHeadingColor,
      marginHorizontal: hp(10),
      textTransform: 'uppercase',
    },
  });
export default SettingSectionList;
