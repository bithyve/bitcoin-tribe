import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { hp } from 'src/constants/responsive';
import GradientView from './GradientView';
import { AppTheme } from 'src/theme';

type CardProps = {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

function CardBox(props: CardProps) {
  const { style, children } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <GradientView
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
      ]}
      style={[styles.container, style]}>
      {children}
    </GradientView>
  );
}

const getStyles = theme =>
  StyleSheet.create({
    container: {
      width: '100%',
      padding: hp(15),
      marginVertical: hp(10),
      borderRadius: 10,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
  });

export default CardBox;
