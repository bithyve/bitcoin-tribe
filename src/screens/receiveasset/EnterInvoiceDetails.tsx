import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import TextField from 'src/components/TextField';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';

const getStyles = (theme: AppTheme, inputHeight) =>
  StyleSheet.create({
    input: {
      marginVertical: hp(5),
    },
    btns: {
      marginVertical: hp(10),
    },
    contentStyle: {
      borderRadius: 0,
      marginVertical: hp(25),
      marginBottom: 0,
      height: Math.max(95, inputHeight),
      marginTop: 0,
    },
    contentStyle1: {
      height: hp(50),
      // marginTop: hp(5),
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
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [assetId, setAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const [inputHeight, setInputHeight] = React.useState(50);
  const styles = getStyles(theme, inputHeight);

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
        multiline={true}
        onContentSizeChange={event => {
          setInputHeight(event.nativeEvent.contentSize.height);
        }}
        numberOfLines={3}
        contentStyle={assetId ? styles.contentStyle : styles.contentStyle1}
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
