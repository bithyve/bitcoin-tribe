import React, { useContext, useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import LabeledContent from 'src/components/LabeledContent';
import { Transaction } from 'src/services/wallets/interfaces';
import { NetworkType, TransactionKind } from 'src/services/wallets/enums';
import config from 'src/utils/config';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { BtcToSats } from 'src/constants/Bitcoin';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import LabelledItem from './LabelledItem';
import TransactionInfoSection from './TransactionInfoSection';
import Toast from 'src/components/Toast';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

type WalletTransactionsProps = {
  transAmount: string;
  transaction: Transaction;
};

function TransactionDetailsContainer(props: WalletTransactionsProps) {
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const { transAmount, transaction } = props;
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const styles = getStyles(theme);

  const redirectToBlockExplorer = () => {
    if (config.NETWORK_TYPE !== NetworkType.REGTEST) {
      const url = `https://mempool.space${
        config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
      }/tx/${transaction.txid}`;

      navigation.navigate(NavigationRoutes.WEBVIEWSCREEN, {
        url,
        title: 'Transaction Details',
      });
    } else {
      Toast('Explorer not available!', true);
    }
  };

  const outputs = useMemo(() => {
    return (transaction?.outputs ?? []).map((output, index) => (
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
    return (transaction?.inputs ?? []).map((input, index) => (
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
    <ScrollView
      overScrollMode="never"
      bounces={false}
      contentContainerStyle={{ paddingBottom: 100 }}>
      <TransactionInfoSection
        amount={transAmount}
        txID={transaction.txid}
        transactionKind={transaction.transactionKind}
        date={transaction.date}
        onIDPress={() => redirectToBlockExplorer()}
      />
      <View style={styles.feeAmtWrapper}>
        <View style={styles.labeledContentWrapper}>
          <LabeledContent
            label={wallet.amount}
            enableCurrency={true}
            content={`${transAmount}`}
          />
        </View>
        <View style={styles.labeledContentWrapper}>
          <LabeledContent
            label={wallet.fees}
            enableCurrency={true}
            content={`${transaction.fee}`}
          />
        </View>
      </View>
      {transaction.confirmations === undefined ? null : (
        <LabelledItem
          label={wallet.confirmations}
          content={`${
            transaction.confirmations === 0
              ? '0'
              : transaction.confirmations > 6
              ? '6+'
              : transaction.confirmations
          }`}
        />
      )}
      {inputs.length ? (
        <View style={[styles.wrapper, styles.borderStyle]}>
          <AppText variant="heading3" style={styles.labelStyle}>
            Input
          </AppText>
          {inputs}
        </View>
      ) : null}
      {outputs.length ? (
        <View style={styles.wrapper}>
          <AppText variant="heading3" style={styles.labelStyle}>
            Output
          </AppText>
          {outputs}
        </View>
      ) : null}
      {transaction.transactionKind === TransactionKind.SERVICE_FEE && (
        <LabeledContent
          label={'Note'}
          content={
            transaction.metadata?.note
              ? transaction.metadata?.note
              : 'Availibe to issue a new asset'
          }
        />
      )}
    </ScrollView>
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
    feeAmtWrapper: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
    labeledContentWrapper: {
      width: '48%',
    },
    borderStyle: {
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderColor,
    },
  });

export default TransactionDetailsContainer;
