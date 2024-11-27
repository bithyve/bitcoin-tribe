/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import Navigator from './navigation/Navigator';
import Contexts from './contexts/Contexts';
import NetworkBanner from './components/NetworkBanner';
import RGBWalletStatus from './components/RGBWalletOffline';

function App() {
  return (
    <Contexts>
      <NetworkBanner />
      <Navigator />
    </Contexts>
  );
}

export default App;
