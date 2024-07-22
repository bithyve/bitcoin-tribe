import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View } from 'react-native';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import LabeledContent from 'src/components/LabeledContent';
import { Transaction } from 'src/services/wallets/interfaces';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import moment from 'moment';
import Capitalize from 'src/utils/capitalizeUtils';

type WalletTransactionsProps = {
  transAmount: string;
  transaction: Transaction;
};

function TransferDetailsContainer(props: WalletTransactionsProps) {
  const theme: AppTheme = useTheme();
  const { transAmount, transaction } = props;
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;

  return (
    <View>
      <LabeledContent
        label={wallet.status}
        content={Capitalize(transaction.status)}
      />
      <LabeledContent
        label={wallet.amount}
        content={numberWithCommas(`${transAmount}`)}
      />
      <LabeledContent
        label={wallet.date}
        content={moment(transaction.updatedAt).format('DD MMM YY  •  hh:mm a')}
      />
    </View>
  );
}
export default TransferDetailsContainer;
