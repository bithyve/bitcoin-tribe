import React, { useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import SentBtcIcon from 'src/assets/images/btcSentAssetTxnIcon.svg';
import RecieveBtcIcon from 'src/assets/images/btcRecieveAssetTxnIcon.svg';
import SentLightningIcon from 'src/assets/images/lightningSentTxnIcon.svg';
import RecieveLightningIcon from 'src/assets/images/lightningRecieveTxnIcon.svg';
import FailedTxnIcon from 'src/assets/images/failedTxnIcon.svg';
import WaitingCounterPartyIcon from 'src/assets/images/waitingCounterPartyIcon.svg';
import WaitingCounterPartySendIcon from 'src/assets/images/waitingCounterPartySendIcon.svg';
import WaitingConfirmationIcon from 'src/assets/images/waitingConfirmationIcon.svg';
import IssuanceIcon from 'src/assets/images/issuanceIcon.svg';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Transfer, TransferKind } from 'src/models/interfaces/RGBWallet';

type AssetTransactionProps = {
  backColor?: string;
  disabled?: boolean;
  transaction: Transfer;
  coin: string;
};
function AssetTransaction(props: AssetTransactionProps) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { assets, settings } = translations;
  const { backColor, disabled, transaction, coin } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, backColor), [theme]);

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
          receiveblind: <WaitingCounterPartyIcon />,
        },
        waitingconfirmations: {
          send: <WaitingConfirmationIcon />,
          receiveblind: <WaitingConfirmationIcon />,
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

    // Add a fallback for the default icons for Bitcoin and Lightning
    const defaultIcons = {
      bitcoin: <RecieveBtcIcon />,
      lightning: <RecieveLightningIcon />,
    };
    // Return the icon based on kind, status, and type, or fall back to the default icon
    return icons[type]?.[status]?.[kind] || defaultIcons[type];
  };


  const amtTextStyle = useMemo(() => {
    const kind = transaction.kind.toUpperCase();
    if(kind === TransferKind.SEND) {
      return styles.amountSend;
    }
    return styles.amountTextReceive;
  }, [styles.amountSend, styles.amountTextReceive, transaction.kind]);

  return (
    <AppTouchable
      disabled={disabled}
      style={styles.containerWrapper}
      onPress={() => {
        navigation.navigate(NavigationRoutes.TRANSFERDETAILS, {
          transaction: transaction,
          coin: coin,
        });
      }}>
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
              {transaction.kind.toLowerCase().replace(/_/g, '') === 'issuance'
                ? assets.issued
                : settings[transaction.status.toLowerCase().replace(/_/g, '')]}
            </AppText>
            <AppText variant="caption" style={styles.transDateText}>
              {moment
                .unix(transaction.createdAt)
                .format('DD MMM YY  •  hh:mm a')}
            </AppText>
          </View>
        </View>
        <View style={styles.amountWrapper}>
          <View style={styles.amtIconWrapper}>
            <AppText
              variant="body1"
              style={[
                amtTextStyle,
                {
                  fontSize: transaction.amount.toString().length > 10 ? 11 : 16,
                },
              ]}>
              &nbsp;{numberWithCommas(transaction.amount)}
            </AppText>
          </View>
          {/* {!disabled ? <IconArrow /> : null} */}
        </View>
      </View>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme, backColor) =>
  StyleSheet.create({
    containerWrapper: {
      paddingVertical: hp(15),
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 1,
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
      width: '60%',
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
      width: '40%',
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
      color: '#4CD964',
      marginTop: hp(2),
    },
    amountSend: {
      color: '#0166FF',
      marginTop: hp(2),
    },
  });
export default AssetTransaction;
