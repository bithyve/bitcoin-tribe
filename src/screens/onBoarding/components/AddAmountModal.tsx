import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import TextField from 'src/components/TextField';
import Buttons from 'src/components/Buttons';

function AddAmountModal() {
  const [amount, setAmount] = useState('');
  const { translations } = useContext(LocalizationContext);
  const { common, receciveScreen } = translations;

  useEffect(() => {
    setAmount('');
  }, []);

  return (
    <View style={styles.saveButtonMargin}>
      <TextField
        value={amount}
        onChangeText={(value: string) => {
          setAmount(value);
        }}
        icon={<IconBitcoin />}
        placeholder={receciveScreen.placeHolderText}
        keyboardType={common.keyboardTypeNumeric}
        maxLength={10}
      />
      <View style={styles.primaryCTAContainer}>
        <Buttons
          primaryTitle={common.save}
          secondaryTitle={common.cancel}
          primaryOnPress={() => {}}
          secondaryOnPress={() => setAmount('')}
          width={wp(120)}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  primaryCTAContainer: {
    marginTop: hp(50),
  },
  saveButtonMargin: {
    marginTop: wp(30),
  },
});

export default AddAmountModal;
