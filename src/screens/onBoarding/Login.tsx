import React from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import EnterPinContainer from './components/EnterPinContainer';

const Login = () => {
  return (
    <ScreenContainer>
      <AppHeader
        title={'Enter your PIN'}
        subTitle={''}
        enableBack={false}
        // onSettingsPress={onSettingsPress}
      />
      <EnterPinContainer />
    </ScreenContainer>
  );
};

export default Login;
