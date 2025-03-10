import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppTheme } from 'src/theme';

interface Props {
  backColor: string;
  style?: { [key: string]: any };
  size?: number;
}

const DotView = (props: Props) => {
  const theme: AppTheme = useTheme();
  const {
    backColor = theme.colors.errorPopupBorderColor,
    style,
    size = 8,
  } = props;
  const styles = getStyles(theme, backColor, size);

  return <View style={[styles.container, style]} />;
};
const getStyles = (theme: AppTheme, backColor, size) =>
  StyleSheet.create({
    container: {
      height: size,
      width: size,
      borderRadius: size,
      backgroundColor: backColor,
    },
  });
export default DotView;
