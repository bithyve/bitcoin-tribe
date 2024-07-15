import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import AppInfoCard from './AppInfoCard';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconCalendar from 'src/assets/images/icon_calender.svg';
import IconInfo from 'src/assets/images/icon_info1.svg';
import { hp } from 'src/constants/responsive';

function AppInfoContainer({ navigation, walletId, version }) {
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <AppInfoCard
        title={common.walletID}
        subTitle={settings.walletIDSubTitle}
        value={walletId}
        icon={<IconInfo />}
      />
      <AppInfoCard
        title={common.versionHistory}
        subTitle={settings.versionHistorySubTitle}
        value={'Tribe App ' + version}
        icon={<IconCalendar />}
        navigation={navigation}
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
