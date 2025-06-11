import React, { useContext, useRef } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';
import Clipboard from '@react-native-clipboard/clipboard';

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
import Toast from 'src/components/Toast';
import NetworkIcon from 'src/assets/images/viewNodeInfo.svg';
import NetworkIconLight from 'src/assets/images/viewNodeInfo_light.svg';
import { NetworkType } from 'src/services/wallets/enums';
import config from 'src/utils/config';
import Capitalize from 'src/utils/capitalizeUtils';

function AppInfoContainer({ navigation, walletId, version }) {
  const { translations } = useContext(LocalizationContext);
  const { common, settings, onBoarding } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { appType } = useContext(AppContext);
  const tapCount = useRef(0);
  const timer = useRef(null);

  const handleTripleTap = () => {
    tapCount.current += 1;
    if (tapCount.current === 1) {
      timer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 500);
    }
    if (tapCount.current === 3) {
      clearTimeout(timer.current);
      tapCount.current = 0;
      navigation.navigate(NavigationRoutes.VIEWLOGS);
    }
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
  const handleCopyText = async (text: string) => {
    await Clipboard.setString(text);
    Toast(settings.copyWalletIDMsg);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{ flex: 1 }}
      onPress={handleTripleTap}>
      <View style={styles.container}>
        <AppInfoCard
          title={settings.activeNetworkLabel}
          value={Capitalize(config.NETWORK_TYPE)}
          icon={isThemeDark ? <NetworkIcon /> : <NetworkIconLight />}
        />
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
          onPress={() => handleCopyText(walletId)}
        />
        <AppInfoCard
          title={common.versionHistory}
          subTitle={settings.versionHistorySubTitle}
          value={version}
          icon={isThemeDark ? <IconCalendar /> : <IconCalendarLight />}
          onPress={() =>
            navigation.navigate(NavigationRoutes.APPVERSIONHISTORY)
          }
          navigation={navigation}
        />
      </View>
    </TouchableOpacity>
  );
}
const getStyles = () =>
  StyleSheet.create({
    container: {
      marginTop: hp(20),
    },
  });
export default AppInfoContainer;
