import React, { useContext, useEffect, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import moment from 'moment';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import { hp, windowWidth } from 'src/constants/responsive';
import SwipeToAction from 'src/components/SwipeToAction';
import Colors from 'src/theme/Colors';
import TransferLabelContent from './TransferLabelContent';
import GradientView from 'src/components/GradientView';
import AppText from 'src/components/AppText';
import {
  TransferKind,
  Transaction,
  TransferStatus,
  RGBWallet,
  receiveUTXOData,
} from 'src/models/interfaces/RGBWallet';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'src/components/Toast';
import AppTouchable from 'src/components/AppTouchable';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';

type WalletTransactionsProps = {
  assetName: string;
  transAmount: string;
  assetId: string;
  transaction: Transaction;
  onPress: () => void;
};

function TransferDetailsContainer(props: WalletTransactionsProps) {
  const theme: AppTheme = useTheme();
  const { assetName, transAmount, assetId, transaction, onPress } = props;
  const { translations } = useContext(LocalizationContext);
  const { wallet, settings, assets } = translations;
  const styles = getStyles(theme);
  const rgbReceiveUtxo: receiveUTXOData = dbManager.getCollection(
    RealmSchema.ReceiveUTXOData,
  );
  const [mismatchError, setMismatchError] = useState(false);
  const normalizedKind = transaction?.kind.toLowerCase().replace(/_/g, '');
  const normalizedStatus = transaction?.status.toLowerCase().replace(/_/g, '');
  function normalize(value: string): string {
    return value.toLowerCase().replace(/_/g, '');
  }

  useEffect(() => {
    const isReceiveBlind =
      normalizedKind === normalize(TransferKind.RECEIVE_BLIND);
    const isSettled = normalizedStatus === normalize(TransferStatus.SETTLED);
    if (isReceiveBlind && isSettled) {
      const matchedTransfer = rgbReceiveUtxo?.find(
        item => item.recipientId === transaction?.recipientId,
      );
      if (
        matchedTransfer &&
        (matchedTransfer?.linkedAsset !== assetId ||
          matchedTransfer?.linkedAmount !== transAmount)
      ) {
        setMismatchError(true);
      }
    } else {
      setMismatchError(false);
    }
  }, []);

  const handleCopyText = async (text: string) => {
    await Clipboard.setString(text);
    Toast(assets.copiedTxIDMsg);
  };

  const kindLabel =
    normalizedKind === normalize(TransferKind.ISSUANCE) &&
    normalizedStatus === normalize(TransferStatus.SETTLED)
      ? settings.issuance
      : normalizedKind === normalize(TransferKind.SEND) &&
        normalizedStatus === normalize(TransferStatus.SETTLED)
      ? settings.send
      : normalizedKind === normalize(TransferKind.RECEIVE_BLIND) &&
        normalizedStatus === normalize(TransferStatus.SETTLED)
      ? settings.receiveblind
      : normalizedKind === normalize(TransferKind.SEND) &&
        normalizedStatus === normalize(TransferStatus.WAITING_COUNTERPARTY)
      ? settings.waitingcounterpartySend
      : normalizedKind === normalize(TransferKind.RECEIVE_BLIND) &&
        normalizedStatus === normalize(TransferStatus.WAITING_COUNTERPARTY)
      ? settings.waitingcounterpartyReceive
      : settings[transaction.status.toLowerCase().replace(/_/g, '')];

  return (
    <View style={styles.container}>
      {mismatchError && (
        <View style={styles.mismatchViewWrapper}>
          <AppText variant="body1" style={styles.headerTextStyle}>
            Value Mismatch Detected
          </AppText>
          <View>
            <AppText variant="body2" style={styles.subTextStyle}>
              There’s a mismatch between what was sent and what you received. It
              could be:
            </AppText>
            <View>
              <AppText
                variant="body2"
                style={[styles.subTextStyle, styles.bulletPointTextStyle]}>
                {`\u2022`}&nbsp;&nbsp;A different asset than expected
              </AppText>
              <AppText
                variant="body2"
                style={[styles.subTextStyle, styles.bulletPointTextStyle]}>
                {`\u2022`}&nbsp;&nbsp;The same asset but with a different amount
              </AppText>
            </View>
          </View>
          <AppText variant="body2" style={styles.subTextStyle}>
            This might happen due to decoding errors or incorrect UTXO handling.
            Please double-check with the sender or contact support if this
            wasn't expected.
          </AppText>
        </View>
      )}
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
          {/* {transaction.batchTransferIdx && (
            <TransferLabelContent
              label={assets.batchTxnIdx}
              content={`${transaction.batchTransferIdx}`}
            />
          )} */}
          <TransferLabelContent
            label={wallet.date}
            content={moment
              .unix(transaction.updatedAt)
              .format('DD MMM YY  •  hh:mm A')}
          />
        </View>
      </View>
      {transaction.status.toLowerCase().replace(/_/g, '') ===
        normalize(TransferStatus.WAITING_COUNTERPARTY) && (
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
    mismatchViewWrapper: {
      marginVertical: hp(10),
      marginBottom: hp(15),
    },
    headerTextStyle: {
      color: theme.colors.headingColor,
      lineHeight: 25,
    },
    subTextStyle: {
      color: theme.colors.secondaryHeadingColor,
      marginVertical: hp(5),
    },
    bulletPointTextStyle: {
      marginLeft: hp(5),
    },
  });
export default TransferDetailsContainer;
