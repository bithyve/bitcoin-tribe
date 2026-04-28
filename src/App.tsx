import React from 'react';
import Navigator from './navigation/Navigator';
import Contexts from './contexts/Contexts';
import { RootSiblingParent } from 'react-native-root-siblings';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(true);

function App() {
  return (
    <Contexts>
      <RootSiblingParent>
        <GestureHandlerRootView>
        <Navigator />
        </GestureHandlerRootView>
      </RootSiblingParent>
    </Contexts>
  );
}

export default App;
