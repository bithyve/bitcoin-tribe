import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { ScrollView, StyleSheet, View } from 'react-native';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { hp } from 'src/constants/responsive';
import SwipeToAction from 'src/components/SwipeToAction';
import Colors from 'src/theme/Colors';
import TransferLabelContent from './TransferLabelContent';
import GradientView from 'src/components/GradientView';
import AppText from 'src/components/AppText';
import {
  TransferKind,
  Transfer,
  TransferStatus,
  receiveUTXOData,
  Asset,
} from 'src/models/interfaces/RGBWallet';
import Toast from 'src/components/Toast';
import AppTouchable from 'src/components/AppTouchable';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import config from 'src/utils/config';
import { NetworkType } from 'src/services/wallets/enums';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import ElectrumClient from 'src/services/electrum/client';
import { useObject } from '@realm/react';

type WalletTransactionsProps = {
  assetName: string;
  transAmount: string;
  assetId: string;
  transaction: Transfer;
  onPress: () => void;
  schema: RealmSchema;
};

function TransferDetailsContainer(props: WalletTransactionsProps) {
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const { assetName, transAmount, assetId, transaction, onPress, schema } =
    props;
  const { translations } = useContext(LocalizationContext);
  const { wallet, settings, assets } = translations;
  const styles = getStyles(theme);
  const rgbReceiveUtxo = dbManager.getCollection(
    RealmSchema.ReceiveUTXOData,
  ) as unknown as receiveUTXOData[];
  const transfer = useObject<Asset>(schema, assetId).transactions.find(
    item => item.txid === transaction?.txid,
  );
  const [mismatchError, setMismatchError] = useState(false);
  const normalizedKind = transfer?.kind.toLowerCase().replace(/_/g, '');
  const normalizedStatus = transfer?.status.toLowerCase().replace(/_/g, '');
  function normalize(value: string): string {
    return value.toLowerCase().replace(/_/g, '');
  }

  useEffect(() => {
    const isReceiveBlind =
      normalizedKind === normalize(TransferKind.RECEIVE_BLIND);
    const isSettled = normalizedStatus === normalize(TransferStatus.SETTLED);
    if (isReceiveBlind && isSettled) {
      const matchedTransfer = rgbReceiveUtxo?.find(
        item => item.recipientId === transfer?.recipientId,
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
      : settings[transfer.status.toLowerCase().replace(/_/g, '')];

  const redirectToBlockExplorer = (txid: string) => {
    if (config.NETWORK_TYPE === NetworkType.REGTEST) {
      handleCopyText(txid);
      return;
    }
    const url = `https://mempool.space${
      config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
    }/tx/${txid}`;

    (navigation as any).navigate(NavigationRoutes.WEBVIEWSCREEN, {
      url,
      title: 'Transaction Details',
    });
  };

  const getTransaction = useCallback(async () => {
    try {
      if (transfer.txid && !transfer.transaction) {
        console.log('GETTING');
        const result = await ElectrumClient.getTransactionsById([
          transfer.txid,
        ]);
        if (result && result[transfer.txid]) {
          // Get the Realm object using dbManager
          const realmAsset = dbManager.getObjectByPrimaryId(
            schema,
            'assetId',
            assetId,
          );

          if (realmAsset && realmAsset.transactions) {
            // Convert to JSON to work with the data
            const assetData = realmAsset.toJSON() as unknown as Asset;
            const transactionIndex = assetData.transactions.findIndex(
              item => item.txid === transfer.txid,
            );

            if (transactionIndex !== -1) {
              // Update the transaction data
              assetData.transactions[transactionIndex].transaction =
                result[transfer.txid];

              // Use dbManager to update the entire transactions array
              const success = dbManager.updateObjectByPrimaryId(
                schema,
                'assetId',
                assetId,
                {
                  transactions: assetData.transactions,
                },
              );

              if (success) {
                console.log('Successfully updated transaction in database');
              } else {
                console.error('Failed to update transaction in database');
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [transfer, schema, assetId]);

  useEffect(() => {
    getTransaction();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {mismatchError && (
          <View style={styles.mismatchViewWrapper}>
            <AppText variant="body1" style={styles.headerTextStyle}>
              {wallet.valueMismatchTitle}
            </AppText>
            <View>
              <AppText variant="body2" style={styles.subTextStyle}>
                {wallet.valueMismatchSubTitle}
              </AppText>
              <View>
                <AppText
                  variant="body2"
                  style={[styles.subTextStyle, styles.bulletPointTextStyle]}>
                  {`\u2022`}&nbsp;&nbsp;{wallet.valueMismatchInfo1}
                </AppText>
                <AppText
                  variant="body2"
                  style={[styles.subTextStyle, styles.bulletPointTextStyle]}>
                  {`\u2022`}&nbsp;&nbsp;{wallet.valueMismatchInfo2}
                </AppText>
              </View>
            </View>
            <AppText variant="body2" style={styles.subTextStyle}>
              {wallet.valueMismatchInfo3}
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
            <TransferLabelContent
              label={assets.assetName}
              content={assetName}
            />
            <TransferLabelContent label={wallet.amount} content={transAmount} />
            {transfer.txid && (
              <AppTouchable
                onPress={() => redirectToBlockExplorer(transfer.txid)}>
                <TransferLabelContent
                  label={wallet.transactionID}
                  content={transfer.txid}
                  contentUnderline={true}
                  selectable={true}
                />
              </AppTouchable>
            )}
            {transfer.transaction && (
              <TransferLabelContent
                label={wallet.date}
                content={moment
                  .unix(transfer.transaction.time)
                  .format('DD MMM YY  •  hh:mm A')}
              />
            )}

            <TransferLabelContent
              label={'RGB Transfer Status'}
              content={transfer.status.toLowerCase().replace(/_/g, '')}
            />

            {transfer?.recipientId && (
              <TransferLabelContent
                label={'Blinded UTXO'}
                selectable={true}
                content={transfer?.recipientId}
              />
            )}

            {transfer?.changeUtxo && (
              <TransferLabelContent
                label={'Change UTXO'}
                selectable={true}
                content={transfer?.changeUtxo?.txid}
              />
            )}

            {transfer?.receiveUtxo && (
              <TransferLabelContent
                label={'Receive UTXO'}
                selectable={true}
                content={transfer?.receiveUtxo?.txid}
              />
            )}

            {transfer?.transportEndpoints?.length > 0 && (
              <TransferLabelContent
                label={'Consignment Endpoints'}
                selectable={true}
                content={transfer.transportEndpoints
                  .map(item => item.endpoint)
                  .join('\n')}
              />
            )}

            {transfer?.invoiceString && (
              <TransferLabelContent
                label={'Invoice'}
                content={transfer?.invoiceString}
                selectable={true}
              />
            )}
          </View>
        </View>
      </ScrollView>
      {transfer.status.toLowerCase().replace(/_/g, '') ===
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
      paddingBottom: hp(5),
    },
    scrollView: {
      paddingBottom: hp(100),
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
      marginTop: hp(10),
      marginBottom: hp(15),
      marginHorizontal: hp(6),
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
