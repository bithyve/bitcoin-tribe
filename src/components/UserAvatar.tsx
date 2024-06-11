import * as React from 'react';
import { Avatar } from 'react-native-paper';

type UserAvatarProps = {
  size: number;
  imageSource: any;
};
const UserAvatar = (props: UserAvatarProps) => {
  const { size, imageSource } = props;
  return <Avatar.Image size={size} source={{ uri: 'file://' + imageSource }} />;
};
export default UserAvatar;
