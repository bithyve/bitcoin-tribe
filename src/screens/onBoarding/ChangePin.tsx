import React, { useContext } from 'react';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ChangePinContainer from './components/ChangePinContainer';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';

function ChangePin() {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, settings } = translations;

  return (
    <ScreenContainer>
      <AppHeader
        title={'Change Passcode'}
        subTitle={'Keep the passcode field empty to remove'}
        // onSettingsPress={onSettingsPress}
      />
      <ChangePinContainer />
    </ScreenContainer>
  );
}

export default ChangePin;
