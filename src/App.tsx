import React from 'react';
import Navigator from './navigation/Navigator';
import Contexts from './contexts/Contexts';
import NetworkBanner from './components/NetworkBanner';
import { SentryWrapper } from './services/sentry';
import FlashMessage from 'react-native-flash-message';
import NotificationListener from './components/NotificationListener';
import { StatusBar } from 'react-native';

function App() {
  return (
    <Contexts>
      <NetworkBanner />
      <NotificationListener />
      <Navigator />
      <FlashMessage
        position="top"
        statusBarHeight={StatusBar.currentHeight || 20}
      />
    </Contexts>
  );
}

export default SentryWrapper(App);
