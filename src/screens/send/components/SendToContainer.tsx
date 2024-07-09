import React, { useContext, useState } from 'react';
import { RadioButton, useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import TextField from 'src/components/TextField';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import DeleteIcon from 'src/assets/images/delete.svg';
import KeyPadView from 'src/components/KeyPadView';
import AppText from 'src/components/AppText';

function SendToContainer() {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, sendScreen } = translations;
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [amount, setAmount] = useState('');
  const [checked, setChecked] = React.useState('Low');

  function onPressNumber(text) {
    let tmpPasscode = amount;
    if (text !== 'x') {
      tmpPasscode += text;
      setAmount(tmpPasscode);
    } else {
      setAmount(amount);
    }
  }

  const onDeletePressed = text => {
    setAmount(amount.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.txnDetailsContainer}>
          <View style={styles.txnLeftWrapper}>
            <View style={styles.leftText}>
              <AppText variant="body1">@</AppText>
            </View>
          </View>
          <View style={styles.txnRightWrapper}>
            <AppText variant="smallCTA" style={styles.sendToAddress}>
              SENDING TO ADDRESS
            </AppText>
            <AppText variant="body1" style={styles.txnID}>
              lk2j3429-85213-5134 50t-934285…
            </AppText>
          </View>
        </View>
        <TextField
          value={amount}
          onChangeText={text => setAmount(text)}
          placeholder={sendScreen.enterAmount}
          keyboardType={'default'}
          icon={<IconBitcoin />}
          rightText={common.sendMax}
          onRightTextPress={() => {}}
        />
        <AppText variant="heading1" style={styles.feeTitleText}>Total Fee: 2034 t-sats</AppText>
        <View style={styles.feeWrapper}>
          <View style={styles.radioBtnWrapper}>
            <RadioButton.Android
              uncheckedColor={theme.colors.bodyColor}
              value="Low"
              status={checked === 'Low' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('Low')}
            />
            <AppText variant="body2" style={styles.feeText}>
              L (1202 sats)
            </AppText>
          </View>
          <View style={styles.radioBtnWrapper}>
            <RadioButton.Android
              uncheckedColor={theme.colors.bodyColor}
              value="Medium"
              status={checked === 'Medium' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('Medium')}
            />
            <AppText variant="body2" style={styles.feeText}>
              M (1200 sats)
            </AppText>
          </View>
          <View style={styles.radioBtnWrapper}>
            <RadioButton.Android
              uncheckedColor={theme.colors.bodyColor}
              value="High"
              status={checked === 'High' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('High')}
            />
            <AppText variant="body2" style={styles.feeText}>
              H (1200 sats)
            </AppText>
          </View>
        </View>
        <View style={styles.primaryCTAContainer}>
          <Buttons
            primaryTitle={common.broadcast}
            secondaryTitle={common.cancel}
            primaryOnPress={() => console.log('')}
            secondaryOnPress={() => console.log('press')}
            width={wp(120)}
          />
        </View>
      </View>
      <View style={styles.keyPadWrapper}>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={theme.colors.primaryCTA}
          ClearIcon={<DeleteIcon />}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: '80%',
      width: '100%',
      marginTop: hp(5),
    },
    primaryCTAContainer: {
      marginVertical: hp(10),
    },
    wrapper: {
      flex: 1,
    },
    keyPadWrapper: {
      marginTop: hp(15),
      flex: 1,
      justifyContent: 'flex-end'
    },
    txnDetailsContainer: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: hp(20),
      alignItems: 'center',
    },
    txnLeftWrapper: {
      width: '20%',
    },
    leftText: {
      backgroundColor: theme.colors.primaryCTA,
      alignItems: 'center',
      justifyContent: 'center',
      height: hp(50),
      width: hp(50),
      borderRadius: hp(50),
    },
    txnRightWrapper: {
      width: '80%',
    },
    sendToAddress: {
      color: theme.colors.primaryCTA,
    },
    txnID: {
      color: theme.colors.bodyColor,
    },
    feeWrapper: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
    radioBtnWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    feeText: {
      color: theme.colors.bodyColor,
    },
    feeTitleText:{
      marginTop: hp(20),
      color: theme.colors.bodyColor,
    }
  });
export default SendToContainer;
