import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import AppTouchable from 'src/components/AppTouchable';
import AppText from 'src/components/AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
type PaymentMethodButtonProps = {
  paymentMethod: PaymentMethodType;
  setPaymentMethod: (paymentMethod: PaymentMethodType) => void;
};

export enum PaymentMethodType {
  SATS = 'sats',
  DOLLARS = 'dollars',
}

const PaymentMethodButton = ({
  paymentMethod,
  setPaymentMethod,
}: PaymentMethodButtonProps) => {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={styles.ctr}>
      <AppTouchable
        onPress={() => setPaymentMethod(PaymentMethodType.SATS)}
        style={[
          styles.feeWrapper,
          {
            borderColor:
              paymentMethod === PaymentMethodType.SATS
                ? theme.colors.accent1
                : theme.colors.borderColor,
          },
        ]}
      >
        <AppText variant="body1Bold" style={[styles.priorityValue]}>
          {sendScreen.payInSats}
        </AppText>
      </AppTouchable>
      <AppTouchable
        onPress={() => setPaymentMethod(PaymentMethodType.DOLLARS)}
        style={[
          styles.feeWrapper,
          {
            borderColor:
              paymentMethod === PaymentMethodType.DOLLARS
                ? theme.colors.accent1
                : theme.colors.borderColor,
          },
        ]}
      >
        <AppText variant="body1Bold" style={styles.priorityValue}>
          {sendScreen.payInDollars}
        </AppText>
      </AppTouchable>
    </View>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    ctr:{ flexDirection: 'row', width: '100%', gap: 13 },
    feeWrapper: {
      paddingVertical: hp(18),
      borderWidth: 1,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    priorityValue: {
      color: theme.colors.headingColor,
    },
  });

export default PaymentMethodButton;
