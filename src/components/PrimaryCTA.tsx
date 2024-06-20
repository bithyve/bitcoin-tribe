import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

import { hp, wp } from 'src/constants/responsive';
import Fonts from 'src/constants/Fonts';
import { AppTheme } from 'src/theme';

type PrimaryCTAProps = {
  onPress: () => void;
  title: string;
  width?: any;
  style?: StyleProp<ViewStyle>;
  buttonColor?: string;
};

function PrimaryCTA(props: PrimaryCTAProps) {
  const theme: AppTheme = useTheme();
  const {
    onPress,
    title,
    width,
    buttonColor = theme.colors.primaryCTA,
  } = props;
  const styles = getStyles(theme, width);

  const generatedTestId = React.useMemo(() => {
    return `primary_cta_${title}`;
  }, [title]);

  return (
    <Button
      testID={generatedTestId}
      contentStyle={styles.container}
      mode="contained"
      uppercase={false}
      labelStyle={[styles.primaryCTATitle, styles.labelStyle]}
      style={styles.ctaContainerStyle}
      buttonColor={buttonColor}
      onPress={onPress}
      maxFontSizeMultiplier={1}>
      {title}
    </Button>
  );
}
const getStyles = (theme: AppTheme, width) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ctaContainerStyle: {
      borderRadius: 10,
      marginVertical: hp(20),
      width: width,
    },
    labelStyle: {
      minWidth: width,
      marginVertical: hp(14),
    },
    primaryCTATitle: {
      fontSize: 13,
      fontFamily: Fonts.PoppinsSemiBold,
      lineHeight: 13 * 1.4,
      height: 18,
    },
  });
export default PrimaryCTA;
