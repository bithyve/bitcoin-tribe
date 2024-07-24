import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

import { AppTheme } from 'src/theme';
type GradientViewProps = {
  children: ReactNode;
  colors: [string, string, string];
  style?: StyleProp<ViewStyle>;
};

function GradientView(props: GradientViewProps) {
  const { style, children, colors } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={style}>
      {children}
    </LinearGradient>
  );
}
const getStyles = (theme: AppTheme) => StyleSheet.create({});
export default GradientView;
