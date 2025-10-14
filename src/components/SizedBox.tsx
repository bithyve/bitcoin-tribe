import React from 'react';
import { View } from 'react-native';

type SizedBoxProps = {
  height?: number;
  width?: number;
};

export const SizedBox = ({ height = 0, width = 0 }: SizedBoxProps) => {
  return (
    <View
      style={{
        height,
        width,
      }}
    />
  );
};
