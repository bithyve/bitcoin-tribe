import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from 'src/theme';
import SelectMenuItem from './SelectMenuItem';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { SettingMenuProps } from 'src/models/interfaces/Settings';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

interface sectionListProps {
  data: SettingMenuProps[];
  sectionTitle: string;
  isDanger?: boolean;
}

function SettingSectionList(props: sectionListProps) {
  const { data, sectionTitle, isDanger } = props;
  const filteredData = data.filter(
    item => item.hideMenu !== false || !item.hideMenu,
  );
  const lastIndex = filteredData.length - 1;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, isDanger, isThemeDark);
  
  return (
    <View style={[styles.container]}>
      <View style={styles.headerSection}>
        <AppText variant="body1" style={[styles.headerText]}>
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
              hasCompletedManualBackup={item.hasCompletedManualBackup}
            />
          ) : null;
        })}
      </View>
    </View>
  );
}

const getStyles = (theme: AppTheme, isDanger: boolean, isThemeDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.cardGradient3,
      borderRadius: 16,
      marginVertical: hp(10),
      borderColor: isDanger ? '#EC5557' : 'transparent',
      borderWidth: isDanger ? 1 : 0,
    },
    headerSection: {
      height: hp(50),
      justifyContent: 'center',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: isDanger
        ? isThemeDark
          ? '#2C2424'
          : '#FFEBEC'
        : theme.colors.settingMenuHeader,
    },
    headerText: {
      color: isDanger ? '#EC5557' : theme.colors.secondaryHeadingColor,
      marginHorizontal: hp(10),
      textTransform: 'uppercase',
    },
  });
export default SettingSectionList;
