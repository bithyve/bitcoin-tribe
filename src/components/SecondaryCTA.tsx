import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { hp, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import Fonts from 'src/constants/Fonts';
import GradientView from './GradientView';

type secondaryCTAProps = {
  title: string;
  onPress: () => void;
  width?: number;
  height?: number;
};
function SecondaryCTA(props: secondaryCTAProps) {
  const { title, onPress, width = 'auto', height } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, width, height);

  const generatedTestId = React.useMemo(() => {
    return `srcondary_cta_${title}`;
  }, [title]);

  return (
    <GradientView
      style={styles.container}
      colors={[
        theme.colors.secondaryCTAGradient1,
        theme.colors.secondaryCTAGradient2,
        theme.colors.secondaryCTAGradient3,
      ]}>
      <Button
        testID={generatedTestId}
        contentStyle={styles.container}
        mode="text"
        uppercase={false}
        textColor={theme.colors.secondaryCtaTitleColor}
        labelStyle={[styles.primaryCTATitle, styles.labelStyle]}
        style={styles.ctaContainerStyle}
        onPress={onPress}
        maxFontSizeMultiplier={1}>
        {title}
      </Button>
    </GradientView>
  );
}

const getStyles = (theme: AppTheme, width, height) =>
  StyleSheet.create({
    container: {
      // flexDirection: 'row',
      // alignItems: 'center',
      borderRadius: 18,
      marginHorizontal: 10,
    },
    ctaContainerStyle: {
      borderRadius: 20,
      // marginVertical: hp(20),
      width: width,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
    labelStyle: {
      // minWidth: width,
      marginVertical: height,
    },
    primaryCTATitle: {
      fontSize: 16,
      fontFamily:
        Platform.OS === 'ios' ? Fonts.LufgaRegular : Fonts.LufgaSemiBold,
      lineHeight: 16 * 1.4,
      fontWeight: '500',
    },
  });

export default SecondaryCTA;
