import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

import Fonts from 'src/constants/Fonts';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';

const LABELS = ['6 Hr', '12 Hr', '1 Day', '2 Day'];
const STEPS = [6, 12, 24, 48];

type Props = {
  value: number;
  onValueChange: (val: number) => void;
};

const InvoiceExpirySlider = ({ value, onValueChange }: Props) => {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const getLabelIndex = () => STEPS.findIndex(v => v === value);

  return (
    <View style={styles.container}>
      <AppText variant="caption" style={styles.title}>
        Invoice Expiry
      </AppText>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={STEPS.length - 1}
        step={1}
        value={getLabelIndex()}
        onValueChange={index => onValueChange(STEPS[index])}
        minimumTrackTintColor={theme.colors.accent1}
        maximumTrackTintColor={theme.colors.borderColor}
        thumbTintColor={theme.colors.accent1}
      />

      <View style={styles.labelRow}>
        {LABELS.map((label, index) => (
          <AppText
            key={index}
            style={[
              styles.label,
              index === getLabelIndex() && styles.activeLabel,
            ]}>
            {label}
          </AppText>
        ))}
      </View>
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginVertical: hp(15),
    },
    title: {
      marginBottom: 10,
      fontSize: 15,
      color: theme.colors.secondaryHeadingColor,
      fontFamily: Fonts.LufgaRegular,
    },
    slider: {
      width: '100%',
      height: 20,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 2,
      marginTop: 5,
    },
    label: {
      fontSize: 13,
      color: theme.colors.headingColor,
      fontFamily: Fonts.LufgaRegular,
    },
    activeLabel: {
      color: theme.colors.accent1,
      fontWeight: '600',
    },
  });

export default InvoiceExpirySlider;
