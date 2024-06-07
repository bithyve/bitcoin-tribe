import * as React from 'react';
import { Avatar } from 'react-native-paper';

type UserAvatarProps = {
  size: number;
  imageSource: any;
};
const UserAvatar = (props: UserAvatarProps) => (
  <Avatar.Image
    size={props.size}
    source={{
      uri: props.imageSource,
    }}
  />
);
export default UserAvatar;
