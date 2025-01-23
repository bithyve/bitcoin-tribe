import React, { useContext } from 'react';

import { LocalizationContext } from 'src/contexts/LocalizationContext';

import CreatePinContainer from './components/CreatePinContainer';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { useRoute } from '@react-navigation/native';

function CreatePin() {
  const { biometricProcess } = useRoute().params;
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, settings } = translations;

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.setPasscodeTitle}
        subTitle={onBoarding.enterPin}
        // onSettingsPress={onSettingsPress}
      />
      <CreatePinContainer biometricProcess={biometricProcess} />
    </ScreenContainer>
  );
}

export default CreatePin;
