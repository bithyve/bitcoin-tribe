import React from 'react';
import Navigator from './navigation/Navigator';
import Contexts from './contexts/Contexts';
import NetworkBanner from './components/NetworkBanner';
import { SentryWrapper } from './services/sentry';

function App() {
  return (
    <Contexts>
      <NetworkBanner />
      <Navigator />
    </Contexts>
  );
}

export default SentryWrapper(App);
