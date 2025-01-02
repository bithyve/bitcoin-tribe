import React from 'react';
import Navigator from './navigation/Navigator';
import Contexts from './contexts/Contexts';
import NetworkBanner from './components/NetworkBanner';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
  return (
    <Contexts>
      <NetworkBanner />
      <GestureHandlerRootView>
        <Navigator />
      </GestureHandlerRootView>
    </Contexts>
  );
}

export default App;
