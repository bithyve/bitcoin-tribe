import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useMMKVBoolean } from 'react-native-mmkv';

import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Transaction } from 'src/services/wallets/interfaces';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import { Keys } from 'src/storage';
import SentBtcIcon from 'src/assets/images/btcSentAssetTxnIcon.svg';
import RecieveBtcIcon from 'src/assets/images/btcRecieveAssetTxnIcon.svg';
import SentLightningIcon from 'src/assets/images/lightningSentTxnIcon.svg';
import RecieveLightningIcon from 'src/assets/images/lightningRecieveTxnIcon.svg';
import FailedTxnIcon from 'src/assets/images/failedTxnIcon.svg';
import WaitingCounterPartyIcon from 'src/assets/images/waitingCounterPartyIcon.svg';
import WaitingConfirmationIcon from 'src/assets/images/waitingConfirmationIcon.svg';

type AssetTransactionProps = {
  transId: string;
  transDate: number;
  transAmount: string;
  transType: string;
  backColor?: string;
  disabled?: boolean;
  transaction: Transaction;
  coin: string;
  tranStatus: string;
};
function AssetTransaction(props: AssetTransactionProps) {
  const navigation = useNavigation();
  const {
    transId,
    transDate,
    transAmount,
    transType,
    backColor,
    disabled,
    transaction,
    coin,
    tranStatus,
  } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme, backColor), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);

  const getStatusIcon = (kind, status, type, isThemeDark) => {
    const icons = {
      send: {
        bitcoin: {
          settled: {
            dark: <SentBtcIcon />,
            light: <SentBtcIcon />,
          },
          waitingcounterparty: {
            dark: <WaitingCounterPartyIcon />,
            light: <WaitingCounterPartyIcon />,
          },
          waitingconfirmations: {
            dark: <WaitingConfirmationIcon />,
            light: <WaitingConfirmationIcon />,
          },
          failed: {
            dark: <FailedTxnIcon />,
            light: <FailedTxnIcon />,
          },
        },
        lightning: {
          settled: {
            dark: <SentLightningIcon />,
            light: <SentLightningIcon />,
          },
          waitingcounterparty: {
            dark: <WaitingCounterPartyIcon />,
            light: <WaitingCounterPartyIcon />,
          },
          waitingconfirmations: {
            dark: <WaitingConfirmationIcon />,
            light: <WaitingConfirmationIcon />,
          },
          failed: {
            dark: <FailedTxnIcon />,
            light: <FailedTxnIcon />,
          },
        },
      },
      receiveBlind: {
        bitcoin: {
          settled: {
            dark: <RecieveBtcIcon />,
            light: <RecieveBtcIcon />,
          },
          waitingcounterparty: {
            dark: <WaitingCounterPartyIcon />,
            light: <WaitingCounterPartyIcon />,
          },
          waitingconfirmations: {
            dark: <WaitingConfirmationIcon />,
            light: <WaitingConfirmationIcon />,
          },
          failed: {
            dark: <FailedTxnIcon />,
            light: <FailedTxnIcon />,
          },
        },
        lightning: {
          settled: {
            dark: <RecieveLightningIcon />,
            light: <RecieveLightningIcon />,
          },
          waitingcounterparty: {
            dark: <WaitingCounterPartyIcon />,
            light: <WaitingCounterPartyIcon />,
          },
          waitingconfirmations: {
            dark: <WaitingConfirmationIcon />,
            light: <WaitingConfirmationIcon />,
          },
          failed: {
            dark: <FailedTxnIcon />,
            light: <FailedTxnIcon />,
          },
        },
      },
      issuance: {
        bitcoin: {
          settled: {
            dark: <SentBtcIcon />,
            light: <SentBtcIcon />,
          },
          waitingcounterparty: {
            dark: <WaitingCounterPartyIcon />,
            light: <WaitingCounterPartyIcon />,
          },
          waitingconfirmations: {
            dark: <WaitingConfirmationIcon />,
            light: <WaitingConfirmationIcon />,
          },
          failed: {
            dark: <FailedTxnIcon />,
            light: <FailedTxnIcon />,
          },
        },
        lightning: {
          settled: {
            dark: <SentLightningIcon />,
            light: <SentLightningIcon />,
          },
          waitingcounterparty: {
            dark: <WaitingCounterPartyIcon />,
            light: <WaitingCounterPartyIcon />,
          },
          waitingconfirmations: {
            dark: <WaitingConfirmationIcon />,
            light: <WaitingConfirmationIcon />,
          },
          failed: {
            dark: <FailedTxnIcon />,
            light: <FailedTxnIcon />,
          },
        },
      },
      default: {
        bitcoin: {
          dark: <RecieveBtcIcon />,
          light: <RecieveBtcIcon />,
        },
        lightning: {
          dark: <RecieveLightningIcon />,
          light: <RecieveLightningIcon />,
        },
      },
    };

    const theme = isThemeDark ? 'dark' : 'light';

    // Return the icon based on kind, type, and status, or fall back to the default icon
    return (
      icons[kind]?.[type]?.[status]?.[theme] || icons.default[type]?.[theme]
    );
  };

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
              transType,
              tranStatus.toLowerCase().replace(/_/g, ''),
              'bitcoin',
              isThemeDark,
            )}
          </View>
          <View style={styles.contentWrapper}>
            <AppText
              variant="body1"
              numberOfLines={1}
              ellipsizeMode="middle"
              style={styles.transIdText}>
              {transId}
            </AppText>
            <AppText variant="caption" style={styles.transDateText}>
              {moment.unix(transDate).format('DD MMM YY  •  hh:mm a')}
            </AppText>
          </View>
        </View>
        <View style={styles.amountWrapper}>
          <View style={styles.amtIconWrapper}>
            <AppText
              variant="body1"
              style={[
                styles.amountText,
                {
                  fontSize: transAmount.toString().length > 10 ? 11 : 16,
                },
              ]}>
              &nbsp;{numberWithCommas(transAmount)}
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
  });
export default AssetTransaction;
