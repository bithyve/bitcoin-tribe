import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { hp } from 'src/constants/responsive';

type CommonCardProps = {
  style?: any;
  children: any;
};

function CommonCardBox(props: CommonCardProps) {
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
export default CommonCardBox;
