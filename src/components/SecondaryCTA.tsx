import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { hp, wp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import Fonts from 'src/constants/Fonts';

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
    <Button
      testID={generatedTestId}
      contentStyle={styles.container}
      mode="text"
      uppercase={false}
      textColor={theme.colors.primaryCTA}
      labelStyle={[styles.primaryCTATitle, styles.labelStyle]}
      style={styles.ctaContainerStyle}
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
