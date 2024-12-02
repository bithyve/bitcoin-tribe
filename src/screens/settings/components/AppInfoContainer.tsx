import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import AppInfoCard from './AppInfoCard';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconCalendar from 'src/assets/images/icon_calender.svg';
import IconCalendarLight from 'src/assets/images/icon_calender_light.svg';
import IconInfo from 'src/assets/images/icon_info1.svg';
import IconInfoLight from 'src/assets/images/icon_info1_light.svg';
import { hp } from 'src/constants/responsive';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

function AppInfoContainer({ navigation, walletId, version }) {
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <AppInfoCard
        title={common.walletID}
        subTitle={settings.walletIDSubTitle}
        value={walletId}
        icon={isThemeDark ? <IconInfo /> : <IconInfoLight />}
      />
      <AppInfoCard
        title={common.versionHistory}
        subTitle={settings.versionHistorySubTitle}
        value={version}
        icon={isThemeDark ? <IconCalendar /> : <IconCalendarLight />}
        navigation={() =>
          navigation.navigate(NavigationRoutes.APPVERSIONHISTORY)
        }
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: hp(20),
    },
  });
export default AppInfoContainer;
