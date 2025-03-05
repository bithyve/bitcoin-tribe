import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import TextField from 'src/components/TextField';
import Buttons from 'src/components/Buttons';
import KeyPadView from 'src/components/KeyPadView';
import { AppTheme } from 'src/theme';
import DeleteIcon from 'src/assets/images/delete.svg';
import DeleteIconLight from 'src/assets/images/delete_light.svg';
import { formatNumber } from 'src/utils/numberWithCommas';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

type AddAmountModalProps = {
  callback: (string) => void;
  secondaryOnPress: () => void;
  primaryOnPress: () => void;
};
function AddAmountModal(props: AddAmountModalProps) {
  const { callback, secondaryOnPress, primaryOnPress } = props;
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const [amount, setAmount] = useState('');
  const { translations } = useContext(LocalizationContext);
  const { common, receciveScreen } = translations;

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

  useEffect(() => {
    callback(amount);
  }, [amount]);

  return (
    <View style={styles.saveButtonMargin}>
      <TextField
        disabled={true}
        value={formatNumber(amount)}
        onChangeText={(value: string) => {
          setAmount(value);
        }}
        icon={<IconBitcoin />}
        placeholder={receciveScreen.placeHolderText}
        keyboardType={'numeric'}
        maxLength={10}
      />
      <View style={styles.primaryCTAContainer}>
        <Buttons
          primaryTitle={common.save}
          secondaryTitle={common.cancel}
          primaryOnPress={() => primaryOnPress()}
          secondaryOnPress={() => {
            setAmount('');
            secondaryOnPress();
          }}
          disabled={amount == ''}
          width={windowWidth / 2.5}
          secondaryCTAWidth={windowWidth / 2.5}
        />
      </View>
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={theme.colors.accent1}
        ClearIcon={isThemeDark ? <DeleteIcon /> : <DeleteIconLight />}
      />
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
