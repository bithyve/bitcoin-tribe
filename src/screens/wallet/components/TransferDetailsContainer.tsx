import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import moment from 'moment';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import { hp } from 'src/constants/responsive';
import SwipeToAction from 'src/components/SwipeToAction';
import Colors from 'src/theme/Colors';
import TransferLabelContent from './TransferLabelContent';
import GradientView from 'src/components/GradientView';
import AppText from 'src/components/AppText';
import {
  AssetTransferKind,
  AssetTransferStatus,
  Transaction,
} from 'src/models/interfaces/RGBWallet';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'src/components/Toast';
import AppTouchable from 'src/components/AppTouchable';

type WalletTransactionsProps = {
  assetName: string;
  transAmount: string;
  transaction: Transaction;
  onPress: () => void;
};

function TransferDetailsContainer(props: WalletTransactionsProps) {
  const theme: AppTheme = useTheme();
  const { assetName, transAmount, transaction, onPress } = props;
  const { translations } = useContext(LocalizationContext);
  const { wallet, settings, assets } = translations;
  const styles = getStyles(theme);

  const handleCopyText = async (text: string) => {
    await Clipboard.setString(text);
    Toast(assets.copiedTxIDMsg);
  };

  const normalizedKind = transaction.kind.toLowerCase().replace(/_/g, '');
  const normalizedStatus = transaction.status.toLowerCase().replace(/_/g, '');
  const kindLabel =
    normalizedKind === AssetTransferKind.Issuance &&
    normalizedStatus === AssetTransferStatus.Settled
      ? settings.issuance
      : normalizedKind === AssetTransferKind.Send &&
        normalizedStatus === AssetTransferStatus.Settled
      ? settings.send
      : normalizedKind === AssetTransferKind.ReceiveBlind &&
        normalizedStatus === AssetTransferStatus.Settled
      ? settings.receiveblind
      : normalizedKind === AssetTransferKind.Send &&
        normalizedStatus === AssetTransferStatus.WaitingCounterparty
      ? settings.waitingcounterpartySend
      : normalizedKind === AssetTransferKind.ReceiveBlind &&
        normalizedStatus === AssetTransferStatus.WaitingCounterparty
      ? settings.waitingcounterpartyReceive
      : settings[transaction.status.toLowerCase().replace(/_/g, '')];

  return (
    <View style={styles.container}>
      <GradientView
        style={styles.statusContainer}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <AppText variant="body1" style={styles.labelStyle}>
          {wallet.status}
        </AppText>
        <AppText variant="body2" style={styles.textStyle}>
          {kindLabel}
        </AppText>
      </GradientView>
      <View style={styles.wrapper}>
        <View style={styles.bodyWrapper}>
          <TransferLabelContent label={assets.assetName} content={assetName} />
          <TransferLabelContent
            label={wallet.amount}
            content={numberWithCommas(transAmount)}
          />
          {transaction.txid && (
            <AppTouchable onPress={() => handleCopyText(transaction.txid)}>
              <TransferLabelContent
                label={wallet.transactionID}
                content={transaction.txid}
              />
            </AppTouchable>
          )}
          {transaction.batchTransferIdx && (
            <TransferLabelContent
              label={assets.batchTxnIdx}
              content={`${transaction.batchTransferIdx}`}
            />
          )}
          <TransferLabelContent
            label={wallet.date}
            content={moment
              .unix(transaction.updatedAt)
              .format('DD MMM YY  •  hh:mm A')}
          />
        </View>
      </View>
      {transaction.status.toLowerCase().replace(/_/g, '') ===
        AssetTransferStatus.WaitingCounterparty && (
        <SwipeToAction
          title={assets.cancelTransactionCtaTitle}
          loadingTitle={assets.cancelTransactionCtaMsg}
          onSwipeComplete={onPress}
          backColor={Colors.FireOpal}
          loaderTextColor={theme.colors.successPopupTitleColor}
        />
      )}
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    statusContainer: {
      paddingHorizontal: hp(15),
      paddingVertical: hp(20),
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: 15,
    },
    wrapper: {
      height: '75%',
    },
    bodyWrapper: {
      marginTop: hp(15),
      padding: hp(15),
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      borderRadius: 10,
      borderStyle: 'dashed',
    },
    labelStyle: {
      color: theme.colors.headingColor,
      width: '50%',
    },
    textStyle: {
      lineHeight: 20,
      color: theme.colors.secondaryHeadingColor,
      flexWrap: 'wrap',
      width: '50%',
      textAlign: 'right',
    },
  });
export default TransferDetailsContainer;
