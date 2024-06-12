import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import React from 'react';
import { hp, wp } from 'src/constants/responsive';

type IconWrapperProps = {
  onPress: () => void;
  children: React.ReactNode;
  style: StyleProp<ViewStyle>;
};
const IconWrapper = ({ children, onPress, style = {} }: IconWrapperProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, style]}
      onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

export default IconWrapper;

const styles = StyleSheet.create({
  container: {
    minHeight: hp(30),
    minWidth: wp(30),
  },
});
