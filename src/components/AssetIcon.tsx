import React, { useState, useEffect, useMemo } from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import Identicon from './Identicon';
import { AppTheme } from 'src/theme';

type props = {
  iconUrl: string;
  assetID: string;
  size: number;
  style?: StyleProp<ViewStyle>;
  verified?: boolean;
};

const AssetIcon = ({ iconUrl, assetID, size, style, verified }: props) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => getStyles(theme, size), [theme, size]);

  return (
    <View>
      {iconUrl ? (
        <Image source={{ uri: iconUrl }} style={styles.imageStyle} />
      ) : (
        <Identicon
          value={assetID}
          size={size}
          style={[styles.identiconView, style]}
        />
      )}
    </View>
  );
};
const getStyles = (theme: AppTheme, size: number) =>
  StyleSheet.create({
    imageStyle: {
      width: size,
      height: size,
      resizeMode: 'contain',
      borderRadius: size,
    },
    identiconView: {
      height: size,
      width: size,
      borderRadius: size,
    },
  });

export default AssetIcon;
