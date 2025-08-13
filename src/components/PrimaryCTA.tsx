import * as React from 'react';
import { Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native';
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
  textColor?: string;
  height?: number;
  primaryCTAIcon?: React.ReactNode;
};

function PrimaryCTA(props: PrimaryCTAProps) {
  const theme: AppTheme = useTheme();
  const {
    onPress,
    title,
    width = wp(120),
    buttonColor = theme.colors.ctaBackColor,
    textColor = theme.colors.primaryCTAText,
    loading,
    disabled = false,
    height = hp(14),
    primaryCTAIcon,
  } = props;
  const styles = getStyles(theme, width, disabled, textColor, height);

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
      textColor={textColor}
      onPress={onPress}
      maxFontSizeMultiplier={1}
      loading={loading}
      disabled={disabled}
      icon={primaryCTAIcon ? () => primaryCTAIcon : undefined}>
      {title}
    </Button>
  );
}
const getStyles = (theme: AppTheme, width, disabled, textColor, height) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ctaContainerStyle: {
      borderRadius: 18,
      // marginVertical: hp(20),
      width: width,
    },
    labelStyle: {
      // minWidth: width,
      marginVertical: height,
      color: disabled ? theme.colors.disableCTATitle : textColor,
    },
    primaryCTATitle: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? Fonts.LufgaRegular : Fonts.LufgaSemiBold,
      lineHeight: 16 * 1.4,
      fontWeight: '500',
      letterSpacing: 0.4,
    },
    disableButton: {
      borderRadius: 18,
      // marginVertical: hp(20),
      width: width,
      backgroundColor: theme.colors.disableCtaBackColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  });
export default PrimaryCTA;
