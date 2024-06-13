import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { hp } from 'src/constants/responsive';

type CardProps = {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

function CardBox(props: CardProps) {
  const { style, children } = props;
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return <View style={[styles.container, style]}>{children}</View>;
}

const getStyles = theme =>
  StyleSheet.create({
    container: {
      width: '100%',
      padding: hp(15),
      marginVertical: hp(10),
      borderRadius: 10,
      backgroundColor: theme.colors.cardBackground,
    },
  });

export default CardBox;
