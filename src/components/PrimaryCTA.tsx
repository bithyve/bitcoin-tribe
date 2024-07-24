import * as React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
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
  loading?: boolean;
  disabled?: boolean;
};

function PrimaryCTA(props: PrimaryCTAProps) {
  const theme: AppTheme = useTheme();
  const {
    onPress,
    title,
    width = wp(120),
    buttonColor = theme.colors.primaryCTA,
    loading,
    disabled = false,
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
      style={disabled ? styles.disableButton : styles.ctaContainerStyle}
      buttonColor={buttonColor}
      onPress={onPress}
      maxFontSizeMultiplier={1}
      loading={loading}
      disabled={disabled}>
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
      borderRadius: 18,
      marginVertical: hp(20),
      width: width,
    },
    labelStyle: {
      // minWidth: width,
      marginVertical: hp(18),
    },
    primaryCTATitle: {
      fontSize: 14,
      fontFamily: Fonts.LufgaSemiBold,
      lineHeight: 14 * 1.4,
      height: 18,
    },
    disableButton: {
      borderRadius: 18,
      marginVertical: hp(20),
      width: width,
      backgroundColor: theme.colors.disableCtaBackColor,
    },
  });
export default PrimaryCTA;
