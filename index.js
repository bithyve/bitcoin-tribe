/**
 * @format
 */

import './shim';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import 'react-native-url-polyfill/auto';
import { getMessaging } from '@react-native-firebase/messaging';

const messaging = getMessaging();

messaging.setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('remoteMessage', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
