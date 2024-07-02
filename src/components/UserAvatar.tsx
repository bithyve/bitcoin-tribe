import * as React from 'react';
import { Avatar, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { AppTheme } from 'src/theme';

type UserAvatarProps = {
  size: number;
  imageSource: any;
};
const UserAvatar = (props: UserAvatarProps) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { size, imageSource } = props;
  return (
    <Avatar.Image
      size={size}
      source={{
        uri: imageSource
          ? 'file://' + imageSource
          : 'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x',
      }}
      style={styles.wrapper}
    />
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: theme.colors.profileBackground,
    },
  });
export default UserAvatar;
