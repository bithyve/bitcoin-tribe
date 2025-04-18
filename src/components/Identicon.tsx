import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Canvas from 'react-native-canvas';
import { IndenticonLib } from './Identiconlib';

interface Props {
  value: string;
  style?: { [key: string]: any };
  size?: number;
}

const Identicon = ({ value, style, size = 45 }: Props) => {
  const canvasRef = useRef(null);

  const handleCanvas = useCallback(
    (canvas: any) => {
      if (canvas) {
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');

        if (ctx) {
          IndenticonLib.generateSync(canvas, { id: value, size }, size);
        } else {
          console.warn('Canvas context is not available.');
        }
      }
    },
    [value, size],
  );

  useEffect(() => {
    if (handleCanvas.current) {
      IndenticonLib.generateSync(
        handleCanvas.current,
        { id: value, size },
        size,
      );
    }
  }, []);

  return (
    <View
      style={[
        { width: size, height: size, borderRadius: 30, overflow: 'hidden' },
        style,
      ]}>
      <Canvas ref={handleCanvas} />
    </View>
  );
};

export default Identicon;
