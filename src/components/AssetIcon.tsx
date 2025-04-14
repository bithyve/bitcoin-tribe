import React, { useState, useEffect, useMemo } from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import Identicon from './Identicon';
import { AppTheme } from 'src/theme';

type props = {
  assetTicker: string;
  assetID: string;
  size: number;
  style?: StyleProp<ViewStyle>;
};

const AssetIcon = ({ assetTicker, assetID, size, style }: props) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => getStyles(theme, size), [theme, size]);

  const [iconUrl, setIconUrl] = useState(null);
  const ticker = assetTicker?.toLowerCase() || '';

  useEffect(() => {
    const fetchIcon = async () => {
      try {
        const url = `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/128/${ticker}.png`;
        const response = await fetch(url);
        if (response.ok) {
          setIconUrl(url);
        } else {
          setIconUrl(null);
        }
      } catch (error) {
        setIconUrl(null);
      }
    };

    if (ticker) {
      fetchIcon();
    }
  }, [ticker]);

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
