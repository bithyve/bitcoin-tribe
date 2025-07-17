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
  const { size, imageSource } = props;
  const styles = getStyles(theme, size);
  return imageSource ? (
    <Avatar.Image
      size={size}
      source={{ uri: imageSource }}
      style={styles.wrapper}
    />
  ) : (
    <View style={styles.placeholderWrapper}>
      <ProfilePlaceholder />
    </View>
  );
};
const getStyles = (theme: AppTheme, size) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: theme.colors.inputBackground,
    },
    placeholderWrapper: {
      backgroundColor: theme.colors.inputBackground,
      height: size,
      width: size,
      borderRadius: size,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
  });
export default UserAvatar;
