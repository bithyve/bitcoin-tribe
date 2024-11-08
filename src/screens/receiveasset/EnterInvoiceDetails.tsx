import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useNavigation } from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import TextField from 'src/components/TextField';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

const styles = StyleSheet.create({
  input: {
    marginVertical: hp(5),
  },
  btns: {
    marginVertical: hp(10),
  },
});

const EnterInvoiceDetails = () => {
  const { translations } = useContext(LocalizationContext);
  const {
    receciveScreen,
    common,
    assets,
    wallet: walletTranslation,
  } = translations;
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [assetId, setAssetId] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <ScreenContainer>
      <AppHeader
        title={assets.receiveAssetTitle}
        subTitle={''}
        enableBack={true}
      />

      <TextField
        value={assetId}
        onChangeText={text => setAssetId(text.trim())}
        placeholder={'Asset ID'}
        style={styles.input}
      />

      <TextField
        value={amount}
        onChangeText={text => setAmount(text.trim())}
        placeholder={'Amount'}
        style={styles.input}
        keyboardType="numeric"
      />

      <View style={styles.btns}>
        <Buttons
          primaryTitle={common.proceed}
          primaryOnPress={() => {
            navigation.replace(NavigationRoutes.RECEIVEASSET, {
              refresh: true,
              assetId,
              amount,
            });
          }}
          secondaryTitle={common.skip}
          secondaryOnPress={() =>
            navigation.replace(NavigationRoutes.RECEIVEASSET, {
              refresh: true,
              assetId,
              amount,
            })
          }
          disabled={assetId === '' || amount === ''}
          width={wp(120)}
        />
      </View>
    </ScreenContainer>
  );
};

export default EnterInvoiceDetails;
