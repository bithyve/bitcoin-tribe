import React, { useContext } from 'react';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import SelectOption from 'src/components/SelectOption';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

import IconTor from 'src/assets/images/icon_tor.svg';
import IconNodes from 'src/assets/images/icon_node.svg';

function ConnectionSettings({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  return (
    <ScreenContainer>
      <AppHeader
        title={settings.connectionSettings}
        subTitle={settings.conSettingScreenSubTitle}
      />
      <SelectOption
        title={settings.tor}
        subTitle={settings.torSubTitle}
        icon={<IconTor />}
        onPress={() => {}}
      />
      <SelectOption
        title={settings.nodeSettings}
        subTitle={settings.nodeSettingSubTitle}
        icon={<IconNodes />}
        onPress={() => navigation.navigate(NavigationRoutes.NODESETTINGS)}
      />
    </ScreenContainer>
  );
}
export default ConnectionSettings;
