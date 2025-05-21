import React, { forwardRef } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

const AppTouchable = forwardRef<TouchableOpacity, TouchableOpacityProps>(
  ({ children, style, onPress, testID, disabled = false, ...rest }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        disabled={disabled}
        style={style}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
        {...rest}>
        {children}
      </TouchableOpacity>
    );
  },
);
export default AppTouchable;
