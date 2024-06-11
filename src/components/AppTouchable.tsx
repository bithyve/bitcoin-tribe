import React, { ReactNode, CSSProperties } from 'react';
import { TouchableRipple } from 'react-native-paper';
import { GestureResponderEvent } from 'react-native/types';

type AppTouchableProps = {
  children: ReactNode;
  style?: CSSProperties;
  onPress: (event: GestureResponderEvent) => void;
};
const AppTouchable = (props: AppTouchableProps) => {
  const { children, style, onPress } = props;
  return (
    <TouchableRipple rippleColor={'gray'} style={style} onPress={onPress}>
      {children}
    </TouchableRipple>
  );
};
export default AppTouchable;
