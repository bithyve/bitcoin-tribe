import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import DeleteIcon from 'src/assets/images/delete.svg';
import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import KeyPadButton from './KeyPadButton';

export interface Props {
  onPressNumber;
  onDeletePressed;
  disabled?;
  keyColor?: string;
  ClearIcon?: JSX.Element;
}
const KeyPadView: React.FC<Props> = ({
  onPressNumber,
  onDeletePressed,
  disabled = false,
  keyColor,
  ClearIcon = <DeleteIcon />,
}: Props) => (
  <View pointerEvents={disabled ? 'none' : 'auto'}>
    <View style={styles.keyWrapperView}>
      <KeyPadButton
        title="1"
        onPressNumber={() => onPressNumber('1')}
        keyColor={keyColor}
      />
      <KeyPadButton
        title="2"
        onPressNumber={() => onPressNumber('2')}
        keyColor={keyColor}
      />
      <KeyPadButton
        title="3"
        onPressNumber={() => onPressNumber('3')}
        keyColor={keyColor}
      />
    </View>
    <View style={styles.keyWrapperView}>
      <KeyPadButton
        title="4"
        onPressNumber={() => onPressNumber('4')}
        keyColor={keyColor}
      />
      <KeyPadButton
        title="5"
        onPressNumber={() => onPressNumber('5')}
        keyColor={keyColor}
      />
      <KeyPadButton
        title="6"
        onPressNumber={() => onPressNumber('6')}
        keyColor={keyColor}
      />
    </View>
    <View style={styles.keyWrapperView}>
      <KeyPadButton
        title="7"
        onPressNumber={() => onPressNumber('7')}
        keyColor={keyColor}
      />
      <KeyPadButton
        title="8"
        onPressNumber={() => onPressNumber('8')}
        keyColor={keyColor}
      />
      <KeyPadButton
        title="9"
        onPressNumber={() => onPressNumber('9')}
        keyColor={keyColor}
      />
    </View>
    <View style={styles.keyWrapperView}>
      <View style={styles.emptyBtnView}>
        <AppText style={{ padding: 15 }}> </AppText>
      </View>
      <KeyPadButton
        title="0"
        onPressNumber={() => onPressNumber('0')}
        keyColor={keyColor}
      />
      <TouchableOpacity
        onPress={() => onDeletePressed()}
        activeOpacity={0.5}
        testID="btn_clear"
        style={styles.keyPadElementTouchable}>
        {ClearIcon}
      </TouchableOpacity>
    </View>
  </View>
);
const styles = StyleSheet.create({
  keyPadElementTouchable: {
    flex: 1,
    height: hp(60),
    fontSize: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyWrapperView: {
    flexDirection: 'row',
    height: hp(60),
  },
  emptyBtnView: {
    flex: 1,
    height: hp(60),
    fontSize: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default KeyPadView;
