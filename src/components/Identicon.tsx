import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { generateIdenticonSvg } from 'src/utils/identicon';
import { SvgXml } from 'react-native-svg';

interface Props {
  value: string;
  style?: { [key: string]: any };
  size?: number;
}

const Identicon = ({ value, style, size = 45 }: Props) => {
  const svgMarkup = generateIdenticonSvg(value, size);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
        },
        style,
      ]}>
      <SvgXml xml={svgMarkup} width={size} height={size} />
    </View>
  );
};

export default Identicon;
