import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import { InvoiceMode } from 'src/models/interfaces/RGBWallet';
import Fonts from 'src/constants/Fonts';

type Props = {
  value: InvoiceMode;
  onChange: (next: InvoiceMode) => void;
  privateLabel: string;
  prepaidLabel: string;
};

function ReceiveInvoiceTypeToggle({
  value,
  onChange,
  privateLabel,
  prepaidLabel,
}: Props) {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const isPrivate = value === InvoiceMode.Blinded;
  const isPrepaid = value === InvoiceMode.Witness;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange(InvoiceMode.Blinded)}
        style={[styles.segment, isPrivate && styles.segmentSelected]}
      >
        <AppText
          variant="body2"
          style={[styles.label, isPrivate && styles.labelSelected]}
        >
          {privateLabel}
        </AppText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => onChange(InvoiceMode.Witness)}
        style={[styles.segment, isPrepaid && styles.segmentSelected]}
      >
        <AppText
          variant="body2"
          style={[styles.label, isPrepaid && styles.labelSelected]}
        >
          {prepaidLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      borderRadius: 999,
      borderWidth: 1,
      backgroundColor: theme.colors.roundedCtaBg,
      padding: 4,
      maxWidth: '80%',
      alignSelf: 'center',
    },
    segment: {
      flex: 1,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: hp(10),
      borderWidth: 1,
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    },
    segmentSelected: {
      borderColor: theme.colors.accent1,
      backgroundColor: theme.colors.modalBackColor,
    },
    label: {
      color: theme.colors.secondaryHeadingColor,
      fontSize: 14,
      fontWeight: '500',
      fontFamily: Fonts.LufgaMedium,
    },
    labelSelected: {
      color: theme.colors.accent1,
    },
  });

export default ReceiveInvoiceTypeToggle;
