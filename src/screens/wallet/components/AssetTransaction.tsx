import React, { useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import moment from 'moment';
import { useMMKVBoolean } from 'react-native-mmkv';

import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import SentBtcIcon from 'src/assets/images/btcSentAssetTxnIcon.svg';
import RecieveBtcIcon from 'src/assets/images/btcRecieveAssetTxnIcon.svg';
import SentLightningIcon from 'src/assets/images/lightningSentTxnIcon.svg';
import RecieveLightningIcon from 'src/assets/images/lightningRecieveTxnIcon.svg';
import FailedTxnIcon from 'src/assets/images/failedTxnIcon.svg';
import WaitingCounterPartyIcon from 'src/assets/images/waitingCounterPartyIcon.svg';
import WaitingCounterPartySendIcon from 'src/assets/images/waitingCounterPartySendIcon.svg';
import WaitingCounterPartyReceiveIcon from 'src/assets/images/waitingCounterPartyReceiveIcon.svg';
import WaitingConfirmationIconSend from 'src/assets/images/waitingConfirmationIconSend.svg';
import WaitingConfirmationIconReceive from 'src/assets/images/waitingConfirmationIconReceive.svg';
import IssuanceIcon from 'src/assets/images/issuanceIcon.svg';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import {
  AssetFace,
  AssetTransferKind,
  AssetTransferStatus,
  Transfer,
  TransferKind,
} from 'src/models/interfaces/RGBWallet';
import IconArrow from 'src/assets/images/icon_arrowr2.svg';
import IconArrowLight from 'src/assets/images/icon_arrowr2light.svg';
import { Keys } from 'src/storage';

type AssetTransactionProps = {
  backColor?: string;
  disabled?: boolean;
  transaction: Transfer;
  coin: string;
  onPress: () => void;
  assetFace?: string;
};
function AssetTransaction(props: AssetTransactionProps) {
  const { translations } = useContext(LocalizationContext);
  const { assets, settings } = translations;
  const { backColor, disabled, transaction, coin, onPress, assetFace } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(
    () => getStyles(theme, backColor, assetFace),
    [theme, backColor, assetFace],
  );
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const getStatusIcon = (kind, status, type) => {
    const icons = {
      bitcoin: {
        settled: {
          send: <SentBtcIcon />,
          receiveblind: <RecieveBtcIcon />,
          issuance: <IssuanceIcon />,
        },
        waitingcounterparty: {
          send: <WaitingCounterPartySendIcon />,
          receiveblind: <WaitingCounterPartyReceiveIcon />,
        },
        waitingconfirmations: {
          send: <WaitingConfirmationIconSend />,
          receiveblind: <WaitingConfirmationIconReceive />,
        },
        failed: {
          send: <FailedTxnIcon />,
          receiveblind: <FailedTxnIcon />,
          issuance: <FailedTxnIcon />,
        },
      },
      lightning: {
        settled: {
          send: <SentLightningIcon />,
          receiveblind: <RecieveLightningIcon />,
          issuance: <IssuanceIcon />,
        },
        failed: {
          send: <FailedTxnIcon />,
          receiveblind: <FailedTxnIcon />,
          issuance: <FailedTxnIcon />,
        },
      },
    };
    const defaultIcons = {
      bitcoin: <RecieveBtcIcon />,
      lightning: <RecieveLightningIcon />,
    };
    return icons[type]?.[status]?.[kind] || defaultIcons[type];
  };

  const amtTextStyle = useMemo(() => {
    const kind = transaction.kind.toUpperCase();
    if (kind === TransferKind.SEND) {
      return styles.amountSend;
    }
    return styles.amountTextReceive;
  }, [styles.amountSend, styles.amountTextReceive, transaction.kind]);

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
    <AppTouchable
      disabled={disabled}
      style={
        assetFace?.toUpperCase() === AssetFace.RGB21
          ? styles.containerWrapper1
          : styles.containerWrapper
      }
      onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.transDetailsWrapper}>
          <View>
            {getStatusIcon(
              transaction.kind.toLowerCase().replace(/_/g, ''),
              transaction.status.toLowerCase().replace(/_/g, ''),
              'bitcoin',
            )}
          </View>
          <View style={styles.contentWrapper}>
            <AppText
              variant="body1"
              numberOfLines={1}
              ellipsizeMode="middle"
              style={styles.transIdText}>
              {kindLabel}
            </AppText>
            <AppText variant="caption" style={styles.transDateText}>
              {moment
                .unix(transaction.createdAt)
                .format('DD MMM YY  •  hh:mm A')}
            </AppText>
          </View>
        </View>
        {assetFace?.toUpperCase() !== AssetFace.RGB21 ? (
          <View style={styles.amountWrapper}>
            <View style={styles.amtIconWrapper}>
              <AppText
                variant="body1"
                style={[
                  amtTextStyle,
                  {
                    fontSize:
                      transaction.amount.toString().length > 10 ? 11 : 16,
                  },
                ]}>
                &nbsp;{numberWithCommas(transaction.amount)}
              </AppText>
            </View>
          </View>
        ) : !disabled ? (
          isThemeDark ? (
            <IconArrow />
          ) : (
            <IconArrowLight />
          )
        ) : null}
      </View>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme, backColor, assetFace) =>
  StyleSheet.create({
    containerWrapper: {
      paddingVertical: hp(15),
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 1,
    },
    containerWrapper1: {
      paddingVertical: hp(10),
      paddingHorizontal: hp(20),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: 10,
    },
    container: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      backgroundColor: backColor,
      padding: backColor ? 15 : 0,
      borderRadius: backColor ? 10 : 0,
    },
    transDetailsWrapper: {
      flexDirection: 'row',
      width: assetFace?.toUpperCase() === AssetFace.RGB21 ? '92%' : '60%',
      alignItems: 'center',
    },
    contentWrapper: {
      marginLeft: 10,
    },
    transIdText: {
      color: theme.colors.headingColor,
    },
    transDateText: {
      color: theme.colors.secondaryHeadingColor,
    },
    amountWrapper: {
      flexDirection: 'row',
      width: assetFace?.toUpperCase() === AssetFace.RGB21 ? '8%' : '40%',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    amtIconWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    amountText: {
      color: theme.colors.headingColor,
      marginTop: hp(2),
    },
    amountTextReceive: {
      color: theme.colors.headingColor,
      marginTop: hp(2),
    },
    amountSend: {
      color: theme.colors.headingColor,
      marginTop: hp(2),
    },
  });
export default AssetTransaction;
