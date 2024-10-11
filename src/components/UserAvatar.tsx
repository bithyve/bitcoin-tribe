import * as React from 'react';
import { Avatar, useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { AppTheme } from 'src/theme';
import ProfilePlaceholder from 'src/assets/images/profilePlaceholder.svg';
import { hp } from 'src/constants/responsive';

type UserAvatarProps = {
  size: number;
  imageSource: any;
};
const UserAvatar = (props: UserAvatarProps) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { size, imageSource } = props;
  return imageSource ? (
    <Avatar.Image
      size={size}
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
    },
    placeholderWrapper: {
      backgroundColor: theme.colors.inputBackground,
      height: hp(70),
      width: hp(70),
      borderRadius: hp(70),
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
  });
export default UserAvatar;
