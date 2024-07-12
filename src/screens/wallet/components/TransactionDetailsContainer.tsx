import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View } from 'react-native';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import LabeledContent from 'src/components/LabeledContent';
import WalletTransactions from './WalletTransactions';
import { Transaction } from 'src/services/wallets/interfaces';
import { TransactionType } from 'src/services/wallets/enums';
import { numberWithCommas } from 'src/utils/numberWithCommas';

type WalletTransactionsProps = {
  transId: string;
  transDate: string;
  transAmount: string;
  transType: string;
  transaction: Transaction;
};

function TransactionDetailsContainer(props: WalletTransactionsProps) {
  const theme: AppTheme = useTheme();
  const { transId, transDate, transAmount, transType, transaction } = props;
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;

  return (
    <View>
      <WalletTransactions
        transId={transId}
        transDate={transDate}
        transAmount={transAmount}
        transType={transType}
        backColor={theme.colors.cardBackground}
        disabled={true}
        transaction={transaction}
      />
      {transType === TransactionType.SENT && (
        <LabeledContent
          label={wallet.toAddress}
          content={transaction.recipientAddresses[0]}
        />
      )}
      {transType === TransactionType.RECEIVED && (
        <LabeledContent
          label={wallet.fromAddress}
          content={transaction.senderAddresses[0]}
        />
      )}
      <LabeledContent label={wallet.transactionID} content={transaction.txid} />
      <LabeledContent
        label={wallet.fees}
        content={numberWithCommas(`${transaction.fee}`)}
      />
      <LabeledContent
        label={wallet.confirmations}
        content={`${
          transaction.confirmations > 6 ? '6+' : transaction.confirmations
        }`}
      />
    </View>
  );
}
export default TransactionDetailsContainer;
