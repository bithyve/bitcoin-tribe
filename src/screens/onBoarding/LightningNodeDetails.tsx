import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppHeader from 'src/components/AppHeader';
import LightningNodeDetailsContainer from './components/LightningNodeDetailsContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

function LightningNodeDetails() {
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
  const [authType, setAuthType] = useState('Basic');

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
        primaryOnPress={() =>
          navigation.navigate(NavigationRoutes.PROFILESETUP)
        }
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) => StyleSheet.create({});
export default LightningNodeDetails;
