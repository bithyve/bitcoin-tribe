import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { hp, wp } from 'src/constants/responsive';

type IconWrapperProps = {
  onPress: () => void;
  children: React.ReactNode;
};
const IconWrapper = ({ children, onPress }: IconWrapperProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={styles.container}
      onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

export default IconWrapper;

const styles = StyleSheet.create({
  container: {
    height: hp(30),
    width: wp(30),
  },
});
