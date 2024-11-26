import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import ScreenContainer from 'src/components/ScreenContainer';
import { wp, windowHeight } from 'src/constants/responsive';
import WalletFooter from './components/WalletFooter';
import RGBNodeWalletDetails from './RGBNodeWalletDetails';
import BtcWalletDetails from './BtcWalletDetails';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import { useQuery } from '@realm/react';

function WalletDetails({ navigation, route }) {
  const [activeTab, setActiveTab] = useState('bitcoin');
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  return (
    <ScreenContainer style={styles.container}>
      {activeTab === 'lightning' ? (
        <RGBNodeWalletDetails
          navigation={navigation}
          route={route}
          activeTab={activeTab}
        />
      ) : (
        <BtcWalletDetails
          navigation={navigation}
          route={route}
          activeTab={activeTab}
        />
      )}
      <View style={styles.footerView}>
        {app.appType === AppType.NODE_CONNECT && (
          <WalletFooter
            activeTab={activeTab}
            setActiveTab={text => setActiveTab(text)}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    height: '100%',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  footerView: {
    height: windowHeight < 670 ? '10%' : '15%',
    marginHorizontal: wp(16),
  },
});
export default WalletDetails;
