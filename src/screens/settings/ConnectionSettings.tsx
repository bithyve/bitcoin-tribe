import React, { ReactNode, useContext } from 'react';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconTor from 'src/assets/images/icon_tor.svg';
import IconNodes from 'src/assets/images/icon_node.svg';
import SettingMenuItem from './components/SettingMenuItem';

type ConnectionSettingMenuProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  onPress: () => void;
};
function ConnectionSettings() {
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;

  const ConnectionSettingMenu: ConnectionSettingMenuProps[] = [
    {
      title: settings.tor,
      subtitle: settings.torSubTitle,
      icon: <IconTor />,
      onPress: () => console.log('tor pressed'),
    },
    {
      title: settings.NodeSettings,
      subtitle: settings.NodeSettingSubTitle,
      icon: <IconNodes />,
      onPress: () => console.log('node setting pressed'),
    },
    // Add more menu items as needed
  ];

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.connectionSettings}
        subTitle={settings.conSettingScreenSubTitle}
      />
      <SettingMenuItem SettingsMenu={ConnectionSettingMenu} />
    </ScreenContainer>
  );
}
export default ConnectionSettings;
