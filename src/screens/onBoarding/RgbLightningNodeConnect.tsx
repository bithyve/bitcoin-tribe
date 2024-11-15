import React, { useContext, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { encode as btoa } from 'base-64';
import { useMutation } from 'react-query';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppHeader from 'src/components/AppHeader';
import LightningNodeDetailsContainer from './components/LightningNodeDetailsContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import AppType from 'src/models/enums/AppType';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import NodeConnectingPopupContainer from './components/NodeConnectingPopupContainer';
import NodeConnectSuccessPopupContainer from './components/NodeConnectSuccessPopupContainer';

function RgbLightningNodeConnect() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, onBoarding } = translations;
  const styles = getStyles(theme);

  const [connectionURL, setConnectionURL] = useState('');
  const [nodeID, setNodeID] = useState('');
  const [userID, setUserID] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [authentication, setAuthentication] = useState(false);
  const [visible, setVisible] = useState(false);
  const [authType, setAuthType] = useState('Bearer');
  const checkNodeConnection = useMutation(ApiHandler.checkRgbNodeConnection);

  useEffect(() => {
    if (checkNodeConnection.data) {
      if (checkNodeConnection.data.pubkey) {
        setTimeout(() => {
          setVisible(true);
        }, 400);
      } else {
        Toast(
          `${
            checkNodeConnection.data.error || checkNodeConnection.data.Message
          }`,
          true,
        );
      }
    } else if (checkNodeConnection.isError) {
      Toast(`${checkNodeConnection.error}`, true);
    }
  }, [checkNodeConnection.data, checkNodeConnection.isError]);

  return (
    <ScreenContainer>
      <AppHeader title={onBoarding.nodeDetails} />
      <LightningNodeDetailsContainer
        onChangeConnectionURLText={text => {
          const trimmedText = text.trim();
          setConnectionURL(trimmedText);
        }}
        inputConnectionURLValue={connectionURL}
        onChangeNodeIDText={text => setNodeID(text)}
        inputNodeIDValue={nodeID}
        onChangeUserIDText={text => setUserID(text)}
        inputUserIDValue={userID}
        onChangeUsernameText={text => setUsername(text)}
        inputUsernameValue={username}
        onChangePasswordText={text => setPassword(text)}
        inputPasswordValue={password}
        onBearerTokenText={text => {
          const trimmedText = text.trim();
          setBearerToken(trimmedText);
        }}
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
      {checkNodeConnection.isLoading && (
        <View>
          <ResponsePopupContainer
            visible={checkNodeConnection.isLoading}
            enableClose={true}
            backColor={theme.colors.modalBackColor}
            borderColor={theme.colors.modalBackColor}>
            <NodeConnectingPopupContainer
              title={onBoarding.nodeConnectingTitle}
              subTitle={onBoarding.nodeConnectingSubTitle}
            />
          </ResponsePopupContainer>
        </View>
      )}
      <View>
        <ResponsePopupContainer
          visible={visible}
          enableClose={true}
          backColor={theme.colors.modalBackColor}
          borderColor={theme.colors.modalBackColor}>
          <NodeConnectSuccessPopupContainer
            title={onBoarding.nodeconnectSuccessfulTitle}
            subTitle={onBoarding.nodeconnectSuccessfulSubTitle}
            onPress={() => {
              setVisible(false);
              navigation.navigate(NavigationRoutes.PROFILESETUP, {
                nodeConnectParams: {
                  nodeUrl: connectionURL,
                  nodeId: nodeID,
                  authentication: `${authType} ${
                    authType === 'Basic'
                      ? btoa(`${username}:${password}`)
                      : bearerToken
                  }`,
                },
                nodeInfo: checkNodeConnection.data,
                appType: AppType.NODE_CONNECT,
              });
            }}
          />
        </ResponsePopupContainer>
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) => StyleSheet.create({});

export default RgbLightningNodeConnect;
