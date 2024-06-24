import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

const AppTouchable = (props: TouchableOpacityProps) => {
  const { children, style, onPress, testID, disabled = false } = props;
  return (
    <TouchableOpacity
      disabled={disabled}
      style={style}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}>
      {children}
    </TouchableOpacity>
  );
};
export default AppTouchable;
