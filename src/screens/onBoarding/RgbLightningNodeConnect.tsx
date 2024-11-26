import React, { useContext, useEffect, useState } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppHeader from 'src/components/AppHeader';
import LightningNodeDetailsContainer from './components/LightningNodeDetailsContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import Toast from 'src/components/Toast';
import { encode as btoa } from 'base-64';
import AppType from 'src/models/enums/AppType';

function RgbLightningNodeConnect() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, onBoarding } = translations;
  const styles = getStyles(theme);

  const [connectionURL, setConnectionURL] = useState('');
  const [nodeID, setNodeID] = useState('743aa565db274cd7a497bec83ad794a6');
  const [userID, setUserID] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [authentication, setAuthentication] = useState(false);
  const [authType, setAuthType] = useState('Bearer');
  const checkNodeConnection = useMutation(ApiHandler.checkRgbNodeConnection);

  useEffect(() => {
    if (checkNodeConnection.data) {
      navigation.navigate(NavigationRoutes.PROFILESETUP, {
        nodeConnectParams: {
          nodeUrl: connectionURL,
          nodeId: nodeID,
          authentication: `${authType} ${
            authType === 'Basic' ? btoa(`${username}:${password}`) : bearerToken
          }`,
        },
        nodeInfo: checkNodeConnection.data,
        appType: AppType.NODE_CONNECT,
      });
    } else if (checkNodeConnection.isError) {
      Toast('Failed to connect to the node', true);
    }
  }, [checkNodeConnection.data, checkNodeConnection.isError]);

  return (
    <ScreenContainer>
      <AppHeader title={onBoarding.nodeDetails} />
      <LightningNodeDetailsContainer
        onChangeConnectionURLText={text => setConnectionURL(text)}
        inputConnectionURLValue={connectionURL}
        onChangeNodeIDText={text => setNodeID(text)}
        inputNodeIDValue={nodeID}
        onChangeUserIDText={text => setUserID(text)}
        inputUserIDValue={userID}
        onChangeUsernameText={text => setUsername(text)}
        inputUsernameValue={username}
        onChangePasswordText={text => setPassword(text)}
        inputPasswordValue={password}
        onBearerTokenText={text => setBearerToken(text)}
        inputBearerTokenValue={bearerToken}
        onChangeAuthentication={text => setAuthentication(!authentication)}
        authChangeValue={authentication}
        onChangeAuthType={text => setAuthType(text)}
        authTypeValue={authType}
        primaryOnPress={() => {
          Keyboard.dismiss();
          checkNodeConnection.reset();
          checkNodeConnection.mutate({
            nodeUrl: connectionURL,
            nodeId: nodeID,
            authentication: `${authType} ${
              authType === 'Basic'
                ? btoa(`${username}:${password}`)
                : bearerToken
            }`,
          });
        }}
        isLoading={checkNodeConnection.isLoading}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) => StyleSheet.create({});

export default RgbLightningNodeConnect;
