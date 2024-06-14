import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

const AppTouchable = (props: TouchableOpacityProps) => {
  const { children, style, onPress, testID } = props;
  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}>
      {children}
    </TouchableOpacity>
  );
};
export default AppTouchable;
