import React, { ReactNode } from 'react';
import { TouchableRipple } from 'react-native-paper';
import {
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native/types';

type AppTouchableProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress: (event: GestureResponderEvent) => void;
};
const AppTouchable = (props: AppTouchableProps) => {
  const { children, style, onPress } = props;
  return (
    <TouchableRipple style={style} onPress={onPress} borderless>
      {children}
    </TouchableRipple>
  );
};
export default AppTouchable;
