import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';

import { AppTheme } from 'src/theme';
import AppInfoCard from './AppInfoCard';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconCalendar from 'src/assets/images/icon_calender.svg';
import IconCalendarLight from 'src/assets/images/icon_calender_light.svg';
import IconInfo from 'src/assets/images/icon_info1.svg';
import IconInfoLight from 'src/assets/images/icon_info1_light.svg';
import { hp } from 'src/constants/responsive';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Keys } from 'src/storage';
import AppType from 'src/models/enums/AppType';
import { AppContext } from 'src/contexts/AppContext';
import MainnetIcon from 'src/assets/images/mainnetIcon.svg';
import MainnetIconLight from 'src/assets/images/mainnetIcon_light.svg';
import LightningIcon from 'src/assets/images/lightningIcon.svg';
import LightningIconLight from 'src/assets/images/lightningIcon_light.svg';
import SupportIcon from 'src/assets/images/supportIcon.svg';
import SupportIconLight from 'src/assets/images/supportIcon_light.svg';

function AppInfoContainer({ navigation, walletId, version }) {
  const { translations } = useContext(LocalizationContext);
  const { common, settings, onBoarding } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { appType } = useContext(AppContext);

  const readRgbLogs = async () => {
    navigation.navigate(NavigationRoutes.VIEWLOGS);
  };

  const getActivateWalletType = (appType: AppType): string => {
    switch (appType) {
      case AppType.ON_CHAIN:
        return onBoarding.mainnet;
      case AppType.NODE_CONNECT:
        return onBoarding.mainnetAndLightning;
      case AppType.SUPPORTED_RLN:
        return onBoarding.supported;
      default:
        return '';
    }
  };

  const getActivateWalletIcon = (appType: AppType) => {
    switch (appType) {
      case AppType.ON_CHAIN:
        return isThemeDark ? <MainnetIcon /> : <MainnetIconLight />;
      case AppType.NODE_CONNECT:
        return isThemeDark ? <LightningIcon /> : <LightningIconLight />;
      case AppType.SUPPORTED_RLN:
        return isThemeDark ? <SupportIcon /> : <SupportIconLight />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <AppInfoCard
        title={settings.activateWalletTypeLabel}
        value={getActivateWalletType(appType)}
        icon={getActivateWalletIcon(appType)}
      />
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

      <AppInfoCard
        title={'RGB Logs'}
        subTitle={'Read RGB Logs'}
        value={'Logs'}
        icon={isThemeDark ? <IconInfo /> : <IconInfoLight />}
        navigation={() => readRgbLogs()}
      />
    </View>
  );
}
const getStyles = () =>
  StyleSheet.create({
    container: {
      marginTop: hp(20),
    },
  });
export default AppInfoContainer;
