import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

import { AppTheme } from 'src/theme';

type HorizontalGradientProps = {
  children: ReactNode;
  colors: [string, string, string];
  style?: StyleProp<ViewStyle>;
};

function HorizontalGradientView(props: HorizontalGradientProps) {
  const { style, children, colors } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={style}>
      {children}
    </LinearGradient>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({});

export default HorizontalGradientView;
