import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { wp, hp } from '../constants/responsive';

type AssetCardProps = {
  icon?: any;
  title?: string;
  details?: string;
};

const AssetCard = (props: AssetCardProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return <View style={styles.container}></View>;
};
const getStyles = theme =>
  StyleSheet.create({
    container: {
      height: hp(205),
      width: wp(160),
      borderRadius: 15,
      backgroundColor: theme.colors.cardBackground,
    },
  });
export default AssetCard;
