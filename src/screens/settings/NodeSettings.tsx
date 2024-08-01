import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet, FlatList } from 'react-native';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import AppText from 'src/components/AppText';
import NodeDetailsCard from './components/NodeDetailsCard';
import { hp } from 'src/constants/responsive';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AddNewIcon from 'src/assets/images/addNew.svg';

const nodes = [
  {
    id: 1,
    ipAddress: '192.0.1.3',
    portNumber: '9890',
    status: true,
  },
  {
    id: 2,
    ipAddress: '192.0.1.0',
    portNumber: '9892',
    status: false,
  },
  {
    id: 3,
    ipAddress: '192.0.1.2',
    portNumber: '9891',
    status: false,
  },
  // {
  //   id: 4,
  //   ipAddress: '192.0.1.3',
  //   portNumber: '9893',
  //   status: false,
  // },
];

function NodeSettings({ navigation }) {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  return (
    <ScreenContainer>
      <AppHeader
        title={settings.nodeSettings}
        subTitle={settings.nodeSettingScreenSubTitle}
        rightIcon={<AddNewIcon />}
        onSettingsPress={() =>
          navigation.navigate(NavigationRoutes.SENDSCREEN, {
            receiveData: 'node',
            title: settings.connectYourNode,
            subTitle: settings.connectYourNodeSubTitle,
          })
        }
      />
      <View>
        <AppText variant="body1" style={styles.titleText}>
          {settings.currentlyConnect}
        </AppText>
      </View>
      <FlatList
        data={nodes}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <NodeDetailsCard
            ipAddress={item.ipAddress}
            portNumber={item.portNumber}
            status={item.status}
          />
        )}
        keyExtractor={item => item.id}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    titleText: {
      color: theme.colors.headingColor,
      marginTop: hp(30),
      marginBottom: hp(10),
    },
  });

export default NodeSettings;
