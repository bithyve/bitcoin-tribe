import React, { ReactNode } from 'react';
import { StyleProp, ViewStyle, View } from 'react-native';
type GradientViewProps = {
  children: ReactNode;
  colors: [string, string, string];
  style?: StyleProp<ViewStyle>;
};

function GradientView(props: GradientViewProps) {
  const { style, children, colors } = props;
  return (
    <View
      style={[
        style,
        {
          experimental_backgroundImage: `linear-gradient(45deg, ${colors[0]}, ${colors[2]})`,
        },
      ]}
    >
      {children}
    </View>
  );
}
export default GradientView;
