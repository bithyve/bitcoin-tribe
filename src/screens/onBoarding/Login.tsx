import React, { useContext } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import EnterPinContainer from './components/EnterPinContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

const Login = () => {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;
  return (
    <ScreenContainer>
      <AppHeader
        title={onBoarding.enterYourPin}
        subTitle={''}
        enableBack={false}
        // onSettingsPress={onSettingsPress}
      />
      <EnterPinContainer />
    </ScreenContainer>
  );
};

export default Login;
