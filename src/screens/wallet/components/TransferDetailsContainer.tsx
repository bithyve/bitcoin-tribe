import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import LabeledContent from 'src/components/LabeledContent';
import { Transaction } from 'src/services/wallets/interfaces';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import moment from 'moment';
import Capitalize from 'src/utils/capitalizeUtils';
import { hp } from 'src/constants/responsive';

type WalletTransactionsProps = {
  transAmount: string;
  transaction: Transaction;
};

function TransferDetailsContainer(props: WalletTransactionsProps) {
  const theme: AppTheme = useTheme();
  const { transAmount, transaction } = props;
  const { translations } = useContext(LocalizationContext);
  const { wallet, settings } = translations;
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <LabeledContent
        label={wallet.status}
        content={settings[transaction.status.toLowerCase().replace(/_/g, '')]}
      />
      <LabeledContent
        label={wallet.amount}
        content={numberWithCommas(`${transAmount}`)}
      />
      <LabeledContent
        label={wallet.date}
        content={moment
          .unix(transaction.updatedAt)
          .format('DD MMM YY  •  hh:mm a')}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: hp(20),
    },
  });
export default TransferDetailsContainer;
