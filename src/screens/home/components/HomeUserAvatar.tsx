import * as React from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, Image, View } from 'react-native';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import ProfilePlaceholder from 'src/assets/images/profilePlaceholder.svg';

type UserAvatarProps = {
  imageSource: any;
};
const HomeUserAvatar = (props: UserAvatarProps) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { imageSource } = props;
  return imageSource ? (
    <Image
      source={{ uri: `data:image/jpeg;base64,${imageSource}` }}
      style={styles.wrapper}
    />
  ) : (
    <View style={styles.placeholderWrapper}>
      <ProfilePlaceholder />
    </View>
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
    placeholderWrapper: {
      backgroundColor: theme.colors.inputBackground,
      height: hp(48),
      width: hp(48),
      borderRadius: hp(15),
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
  });
export default HomeUserAvatar;
