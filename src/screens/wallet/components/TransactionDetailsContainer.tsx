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
import moment from 'moment';

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
  console.log('transaction', transaction.confirmations !== 0);

  return (
    <View>
      {transId && (
        <WalletTransactions
          transId={transId}
          transDate={transDate}
          transAmount={transAmount}
          transType={transType}
          backColor={theme.colors.cardBackground}
          disabled={true}
          transaction={transaction}
        />
      )}
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
      {transaction && transaction.txid && (
        <LabeledContent
          label={wallet.transactionID}
          content={transaction.txid}
        />
      )}
      {transaction && transaction.fee && (
        <LabeledContent
          label={wallet.fees}
          content={numberWithCommas(`${transaction.fee}`)}
        />
      )}
      {transaction && transaction.status && (
        <LabeledContent
          label={wallet.status}
          content={transaction.status.toUpperCase()}
        />
      )}
      {transAmount && (
        <LabeledContent
          label={wallet.amount}
          content={numberWithCommas(`${transAmount}`)}
        />
      )}
      {transaction.updatedAt && (
        <LabeledContent
          label={wallet.date}
          content={moment(transaction.updatedAt).format(
            'DD MMM YY  •  hh:mm a',
          )}
        />
      )}
      {transaction.confirmations && transaction.confirmations !== 0 ? (
        <LabeledContent
          label={wallet.confirmations}
          content={`${
            transaction.confirmations > 6 ? '6+' : transaction.confirmations
          }`}
        />
      ) : null}
    </View>
  );
}
export default TransactionDetailsContainer;
