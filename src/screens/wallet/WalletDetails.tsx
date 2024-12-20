import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useQuery } from '@realm/react';

import ScreenContainer from 'src/components/ScreenContainer';
import { hp, wp } from 'src/constants/responsive';
import WalletFooter from './components/WalletFooter';
import RGBNodeWalletDetails from './RGBNodeWalletDetails';
import BtcWalletDetails from './BtcWalletDetails';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';

function WalletDetails({ navigation, route }) {
  const [activeTab, setActiveTab] = useState('bitcoin');
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.bodyView}>
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
      </View>
      {app.appType === AppType.NODE_CONNECT && (
        <View style={styles.footerView}>
          <WalletFooter
            activeTab={activeTab}
            setActiveTab={text => setActiveTab(text)}
          />
        </View>
      )}
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  bodyView: {
    height: '93%',
  },
  container: {
    flexDirection: 'column',
    height: '100%',
    paddingHorizontal: 0,
    // paddingTop: hp(20),
  },
  footerView: {
    height: '10%',
    marginHorizontal: wp(16),
  },
});
export default WalletDetails;
