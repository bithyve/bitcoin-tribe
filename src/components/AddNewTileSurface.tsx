import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { hp, wp } from '../constants/responsive';

type AddNewTileSurfaceProps = {
  icon?: any;
  title?: string;
};

const AddNewTileSurface = (props: AddNewTileSurfaceProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return <View style={styles.container}></View>;
};
const getStyles = theme =>
  StyleSheet.create({
    container: {
      height: hp(150),
      width: wp(160),
      borderRadius: 10,
      backgroundColor: theme.colors.textColor,
    },
  });
export default AddNewTileSurface;
