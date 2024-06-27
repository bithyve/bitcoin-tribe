import * as React from 'react';
import { Avatar } from 'react-native-paper';

type UserAvatarProps = {
  size: number;
  imageSource: any;
};
const UserAvatar = (props: UserAvatarProps) => {
  const { size, imageSource } = props;
  console.log('imageSource', imageSource);
  return (
    <Avatar.Image
      size={size}
      source={{ uri: `data:image/jpeg;base64,${imageSource}` }}
    />
  );
};
export default UserAvatar;
