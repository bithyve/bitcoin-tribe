import * as React from 'react';
import { Avatar } from 'react-native-paper';

type CardImageSurfaceProps = {
  size: number;
  imageSource: any;
};
const CardImageSurface = (props: CardImageSurfaceProps) => (
  <Avatar.Image
    size={props.size}
    source={{
      uri: props.imageSource,
    }}
  />
);
export default CardImageSurface;
