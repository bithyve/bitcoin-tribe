import * as React from 'react';
import { Avatar } from 'react-native-paper';

const CardImageSurface = props => (
  <Avatar.Image
    size={props.size}
    source={{
      uri: props.imageSource,
    }}
  />
);
export default CardImageSurface;
