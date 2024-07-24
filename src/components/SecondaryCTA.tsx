import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { hp, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import Fonts from 'src/constants/Fonts';
import GradientView from './GradientView';

type secondaryCTAProps = {
  title: string;
  onPress: () => void;
  width?: number;
};
function SecondaryCTA(props: secondaryCTAProps) {
  const { title, onPress, width = undefined } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme, width);

  const generatedTestId = React.useMemo(() => {
    return `srcondary_cta_${title}`;
  }, [title]);

  return (
    <GradientView
      style={styles.container}
      colors={[
        theme.colors.cardGradient1,
        theme.colors.cardGradient2,
        theme.colors.cardGradient3,
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

const getStyles = (theme: AppTheme, width) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
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
      minWidth: width,
      marginVertical: hp(18),
    },
    primaryCTATitle: {
      fontSize: 14,
      fontFamily: Fonts.LufgaSemiBold,
      lineHeight: 14 * 1.4,
      height: 18,
    },
  });

export default SecondaryCTA;
