import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import LabeledContent from 'src/components/LabeledContent';
import { Transaction } from 'src/services/wallets/interfaces';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import moment from 'moment';
// import Capitalize from 'src/utils/capitalizeUtils';
import { hp } from 'src/constants/responsive';
import PrimaryCTA from 'src/components/PrimaryCTA';

type WalletTransactionsProps = {
  transAmount: string;
  transaction: Transaction;
  onPress: () => void;
};

function TransferDetailsContainer(props: WalletTransactionsProps) {
  const theme: AppTheme = useTheme();
  const { transAmount, transaction, onPress } = props;
  const { translations } = useContext(LocalizationContext);
  const { wallet, settings, assets } = translations;
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
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
      {transaction.status.toLowerCase().replace(/_/g, '') ===
        'waitingcounterparty' && (
        <View>
          <PrimaryCTA
            title={assets.cancelTransaction}
            onPress={onPress}
            width={'100%'}
            textColor={theme.colors.popupSentCTATitleColor}
            buttonColor={theme.colors.popupSentCTABackColor}
            height={hp(18)}
          />
        </View>
      )}
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: hp(20),
      flex: 1,
    },
    wrapper: {
      height: '89%',
    },
  });
export default TransferDetailsContainer;
