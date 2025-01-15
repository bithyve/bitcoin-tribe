import React from 'react';
import Navigator from './navigation/Navigator';
import Contexts from './contexts/Contexts';
import NetworkBanner from './components/NetworkBanner';

function App() {
  return (
    <Contexts>
      <NetworkBanner />
      <Navigator />
    </Contexts>
  );
}

export default App;
