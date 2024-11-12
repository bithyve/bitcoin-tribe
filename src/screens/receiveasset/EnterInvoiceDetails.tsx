import React, { useContext, useMemo, useState } from 'react';
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
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import { ApiHandler } from 'src/services/handler/apiHandler';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import AppText from 'src/components/AppText';

const getStyles = (theme: AppTheme, inputHeight, totalReserveSatsAmount) =>
  StyleSheet.create({
    input: {
      marginVertical: hp(5),
    },
    bodyWrapper: {
      height: totalReserveSatsAmount === 0 ? '64%' : '66%',
    },
    footerWrapper: {
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
    reservedSatsWrapper: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      marginVertical: hp(20),
    },
    checkIconWrapper: {
      width: '10%',
    },
    reservedSatsWrapper1: {
      width: '90%',
    },
    reservedSatsText: {
      color: theme.colors.secondaryHeadingColor,
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

  const storedWallet = dbManager.getObjectByIndex(RealmSchema.RgbWallet);
  const UnspentUTXOData = storedWallet.utxos.map(utxoStr =>
    JSON.parse(utxoStr),
  );

  const totalReserveSatsAmount = useMemo(() => {
    return ApiHandler.calculateTotalReserveSatsAmount(UnspentUTXOData);
  }, [UnspentUTXOData]);

  const styles = getStyles(theme, inputHeight, totalReserveSatsAmount);

  return (
    <ScreenContainer>
      <AppHeader
        title={assets.receiveAssetTitle}
        subTitle={''}
        enableBack={true}
      />
      <View style={styles.bodyWrapper}>
        <TextField
          value={assetId}
          onChangeText={text => setAssetId(text.trim())}
          placeholder={assets.assetId}
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
          placeholder={assets.amount}
          style={styles.input}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.footerWrapper}>
        {totalReserveSatsAmount === 0 ? (
          <View style={styles.reservedSatsWrapper}>
            <View style={styles.checkIconWrapper}>
              <CheckIcon />
            </View>
            <View style={styles.reservedSatsWrapper1}>
              <AppText variant="body2" style={styles.reservedSatsText}>
                {assets.reservedSats}
              </AppText>
            </View>
          </View>
        ) : null}
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
