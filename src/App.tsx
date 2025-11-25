import React from 'react';
import Navigator from './navigation/Navigator';
import Contexts from './contexts/Contexts';
import { SentryWrapper } from './services/sentry';
import { RootSiblingParent } from 'react-native-root-siblings';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

export default SentryWrapper(App);
