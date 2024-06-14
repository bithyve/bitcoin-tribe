import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { wp } from 'src/constants/responsive';

type QRBorderCardProps = {
  style?: StyleProp<ViewStyle>;
};

function QRBorderCard(props: QRBorderCardProps) {
  const { style } = props;
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return <View style={[styles.container, style]} />;
}

const getStyles = theme =>
  StyleSheet.create({
    container: {
      height: wp(50),
      width: wp(50),
      borderColor: theme.colors.headingColor,
    },
  });

export default QRBorderCard;
