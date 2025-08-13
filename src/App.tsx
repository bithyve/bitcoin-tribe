import React from 'react';
import Navigator from './navigation/Navigator';
import Contexts from './contexts/Contexts';
import NetworkBanner from './components/NetworkBanner';
import { SentryWrapper } from './services/sentry';
import { RootSiblingParent } from 'react-native-root-siblings';

function App() {
  return (
    <Contexts>
      <NetworkBanner />
      <RootSiblingParent>
        <Navigator />
      </RootSiblingParent>
    </Contexts>
  );
}

export default SentryWrapper(App);
