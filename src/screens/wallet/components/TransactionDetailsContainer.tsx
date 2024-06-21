import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View } from 'react-native';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import LabeledContent from 'src/components/LabeledContent';
import WalletTransactions from './WalletTransactions';

type WalletTransactionsProps = {
  transId: string;
  transDate: string;
  transAmount: string;
  transType: string;
};

function TransactionDetailsContainer(props: WalletTransactionsProps) {
  const theme: AppTheme = useTheme();
  const { transId, transDate, transAmount, transType } = props;
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
      />
      <LabeledContent
        label={wallet.toAddress}
        content={'1Lbcfr7sAHTD9CgdQo3HTMTkV8LK4ZnX71'}
      />
      <LabeledContent
        label={wallet.fromAddress}
        content={'1Lbcfr7sAHTD9CgdQo3HTMTkV8LK4ZnX71'}
      />
      <LabeledContent
        label={wallet.transactionID}
        content={'1Lbcfr7sAHTD9CgdQo3HTMTkV8LK4ZnX71'}
      />
      <LabeledContent label={wallet.fees} content={'0.0001'} />
      <LabeledContent label={wallet.confirmations} content={' 6+'} />
    </View>
  );
}
export default TransactionDetailsContainer;
