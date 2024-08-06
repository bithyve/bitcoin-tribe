import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View } from 'react-native';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import LabeledContent from 'src/components/LabeledContent';
import WalletTransactions from './WalletTransactions';
import { Transaction } from 'src/services/wallets/interfaces';
import { NetworkType, TransactionType } from 'src/services/wallets/enums';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import openLink from 'src/utils/OpenLink';
import AppTouchable from 'src/components/AppTouchable';
import config from 'src/utils/config';

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

  const redirectToBlockExplorer = () => {
    openLink(
      `https://mempool.space${
        config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
      }/tx/${transaction.txid}`,
    );
  };
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
      <AppTouchable onPress={() => redirectToBlockExplorer()}>
        <LabeledContent
          label={wallet.transactionID}
          content={transaction.txid}
        />
      </AppTouchable>
      <LabeledContent
        label={wallet.fees}
        content={numberWithCommas(`${transaction.fee}`)}
      />
      <LabeledContent
        label={wallet.amount}
        content={numberWithCommas(`${transAmount}`)}
      />
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
