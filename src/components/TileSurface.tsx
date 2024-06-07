import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

type TileSurfaceProps = {
  icon?: any;
  title?: string;
  details?: string;
};

const TileSurface = (props: TileSurfaceProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return <View style={styles.container}></View>;
};
const getStyles = theme =>
  StyleSheet.create({
    container: {
      height: 205,
      width: 160,
      borderRadius: 10,
      backgroundColor: theme.colors.textColor,
    },
  });
export default TileSurface;
