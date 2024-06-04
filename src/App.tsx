/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import Navigator from './navigation/Navigator';
import { PaperProvider } from 'react-native-paper';
import { theme } from './theme';

function App() {
  return (
    <PaperProvider theme={theme}>
      <Navigator />
    </PaperProvider>
  );
}

export default App;
