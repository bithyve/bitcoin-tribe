import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import moment from 'moment';
import { useMMKVBoolean } from 'react-native-mmkv';

import { hp } from 'src/constants/responsive';
import AppText from 'src/components/AppText';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
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
import { Transfer } from 'src/models/interfaces/RGBWallet';
import IconArrow from 'src/assets/images/icon_arrowr2.svg';
import IconArrowLight from 'src/assets/images/icon_arrowr2light.svg';
import { Keys } from 'src/storage';
import GradientView from 'src/components/GradientView';

type UdaTransactionProps = {
  transaction: Transfer;
  coin: string;
  onPress: () => void;
};
function UDATransaction(props: UdaTransactionProps) {
  const { translations } = useContext(LocalizationContext);
  const { assets, settings } = translations;
  const { transaction, coin, onPress } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
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
    const defaultIcons = {
      bitcoin: <RecieveBtcIcon />,
      lightning: <RecieveLightningIcon />,
    };
    return icons[type]?.[status]?.[kind] || defaultIcons[type];
  };

  return (
    <AppTouchable onPress={onPress}>
      <GradientView
        style={styles.container}
        colors={[
          theme.colors.cardGradient1,
          theme.colors.cardGradient2,
          theme.colors.cardGradient3,
        ]}>
        <View style={styles.transDetailsWrapper}>
          <View>
            {getStatusIcon(
              transaction?.kind?.toLowerCase().replace(/_/g, ''),
              transaction?.status?.toLowerCase().replace(/_/g, ''),
              'bitcoin',
            )}
          </View>
          <View style={styles.contentWrapper}>
            <AppText
              variant="body1"
              numberOfLines={1}
              ellipsizeMode="middle"
              style={styles.transIdText}>
              {transaction?.kind?.toLowerCase().replace(/_/g, '') === 'issuance'
                ? assets.issued
                : settings[
                    transaction?.status?.toLowerCase().replace(/_/g, '')
                  ]}
            </AppText>
            <AppText variant="caption" style={styles.transDateText}>
              {moment
                .unix(transaction?.createdAt)
                .format('DD MMM YY  •  hh:mm a')}
            </AppText>
          </View>
        </View>
        <View style={styles.arrowWrapper}>
          {isThemeDark ? <IconArrow /> : <IconArrowLight />}
        </View>
      </GradientView>
    </AppTouchable>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      padding: hp(15),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: 10,
    },
    transDetailsWrapper: {
      flexDirection: 'row',
      width: '90%',
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
    arrowWrapper: {
      width: '10%',
    },
  });
export default UDATransaction;
