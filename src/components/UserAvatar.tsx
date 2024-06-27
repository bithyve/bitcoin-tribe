import * as React from 'react';
import { Avatar } from 'react-native-paper';

type UserAvatarProps = {
  size: number;
  imageSource: any;
};
const UserAvatar = (props: UserAvatarProps) => {
  const { size, imageSource } = props;
  return (
    <Avatar.Image
      size={size}
      source={{
        uri: imageSource
          ? `data:image/jpeg;base64,${imageSource}`
          : 'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x',
      }}
    />
  );
};
export default UserAvatar;
