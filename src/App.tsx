/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import Navigator from './navigation/Navigator';
import Contexts from './contexts/Contexts';

function App() {
  return (
    <Contexts>
      <Navigator />
    </Contexts>
  );
}

export default App;
