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
  style?: StyleProp<ViewStyle>;
  testID?: string;
};
const IconWrapper = ({ children, onPress, style = {}, testID }: IconWrapperProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, style]}
      onPress={onPress}
      testID={testID}>
      {children}
    </TouchableOpacity>
  );
};

export default IconWrapper;

const styles = StyleSheet.create({
  container: {
    minHeight: hp(30),
    minWidth: wp(30),
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    marginHorizontal: 2,
  },
});
