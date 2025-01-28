import React, { useContext, useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import LabeledContent from 'src/components/LabeledContent';
import WalletTransactions from './WalletTransactions';
import { Transaction } from 'src/services/wallets/interfaces';
import { NetworkType, TransactionKind } from 'src/services/wallets/enums';
import openLink from 'src/utils/OpenLink';
import AppTouchable from 'src/components/AppTouchable';
import config from 'src/utils/config';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { BtcToSats } from 'src/constants/Bitcoin';
import { numberWithCommas } from 'src/utils/numberWithCommas';

type WalletTransactionsProps = {
  transAmount: string;
  transaction: Transaction;
};

function TransactionDetailsContainer(props: WalletTransactionsProps) {
  const theme: AppTheme = useTheme();
  const { transAmount, transaction } = props;
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const styles = getStyles(theme);

  const redirectToBlockExplorer = () => {
    if (config.NETWORK_TYPE !== NetworkType.REGTEST) {
      openLink(
        `https://mempool.space${
          config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
        }/tx/${transaction.txid}`,
      );
    }
  };

  const outputs = useMemo(() => {
    return transaction?.outputs.map((output, index) => (
      <View key={index} style={styles.wrapperOutput}>
        <AppText
          numberOfLines={1}
          variant="body2"
          selectable
          style={[styles.textStyle, { flex: 7 }]}>
          {output.scriptPubKey.address}
        </AppText>
        <AppText
          numberOfLines={1}
          variant="body2"
          style={[styles.textStyle, { flex: 3, textAlign: 'right' }]}>
          {numberWithCommas(BtcToSats(output.value))}
        </AppText>
      </View>
    ));
  }, [transaction?.outputs]);

  const inputs = useMemo(() => {
    return transaction?.inputs.map((input, index) => (
      <View key={index} style={styles.wrapperOutput}>
        <AppText
          numberOfLines={1}
          variant="body2"
          style={[styles.textStyle, { flex: 7 }]}>
          {input.addresses.join(', ')}
        </AppText>
        <AppText
          numberOfLines={1}
          variant="body2"
          style={[styles.textStyle, { flex: 3, textAlign: 'right' }]}>
          {numberWithCommas(BtcToSats(input.value))}
        </AppText>
      </View>
    ));
  }, [transaction?.inputs]);

  return (
    <View>
      <WalletTransactions
        transId={transaction.transactionKind || transaction.txid}
        transDate={transaction.date}
        transAmount={transAmount}
        transType={transaction.transactionType}
        backColor={theme.colors.cardBackground}
        disabled={true}
        transaction={transaction}
        networkType={transaction.txid ? 'bitcoin' : 'lightning'}
      />
      {/* {transaction.transactionType === TransactionType.SENT && (
        <LabeledContent
          label={wallet.toAddress}
          content={transaction.recipientAddresses[0]}
        />
      )}
      {transaction.transactionType === TransactionType.RECEIVED && (
        <LabeledContent
          label={wallet.fromAddress}
          content={transaction.senderAddresses[0]}
        />
      )} */}
      <AppTouchable onPress={() => redirectToBlockExplorer()}>
        <LabeledContent
          label={wallet.transactionID}
          content={transaction.txid}
        />
      </AppTouchable>
      <LabeledContent
        label={wallet.fees}
        enableCurrency={true}
        content={`${transaction.fee}`}
      />
      <LabeledContent
        label={wallet.amount}
        enableCurrency={true}
        content={`${transAmount}`}
      />
      <LabeledContent
        label={wallet.confirmations}
        content={`${
          transaction.confirmations === 0
            ? '0'
            : transaction.confirmations > 6
            ? '6+'
            : transaction.confirmations
        }`}
      />

      <View style={styles.wrapper}>
        <AppText variant="body1" style={styles.labelStyle}>
          Input
        </AppText>
        {inputs}
      </View>

      <View style={styles.wrapper}>
        <AppText variant="body1" style={styles.labelStyle}>
          Output
        </AppText>
        {outputs}
      </View>

      {transaction.transactionKind === TransactionKind.SERVICE_FEE && (
        <LabeledContent
          label={'Note'}
          content={transaction.metadata?.note ? transaction.metadata?.note : 'Availibe to issue a new asset'}
        />
      )}
    </View>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    labelStyle: {
      color: theme.colors.headingColor,
    },
    textStyle: {
      lineHeight: 20,
      color: theme.colors.secondaryHeadingColor,
    },
    wrapper: {
      marginVertical: hp(10),
    },
    wrapperOutput: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });

export default TransactionDetailsContainer;
