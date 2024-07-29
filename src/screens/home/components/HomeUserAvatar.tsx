import * as React from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, Image } from 'react-native';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';

type UserAvatarProps = {
  imageSource: any;
};
const HomeUserAvatar = (props: UserAvatarProps) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { imageSource } = props;
  return (
    <Image
      source={{ uri: `data:image/jpeg;base64,${imageSource}` }}
      style={styles.wrapper}
    />
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: theme.colors.inputBackground,
      height: hp(48),
      width: hp(48),
      borderRadius: hp(15),
    },
  });
export default HomeUserAvatar;
