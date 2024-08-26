import React from 'react';
import { View } from 'react-native';

function Scale({ scale, children }: { scale: number; children }) {
  return <View style={{ transform: [{ scale }] }}>{children}</View>;
}

export default Scale;
