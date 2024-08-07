import React, { useContext, useEffect } from 'react';
import { RadioButton, useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

import { AppTheme } from 'src/theme';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import AppText from 'src/components/AppText';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { TransactionPrerequisite } from 'src/services/wallets/interfaces';
import { TxPriority } from 'src/services/wallets/enums';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import Toast from 'src/components/Toast';
import { useNavigation } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import SendAddressIcon from 'src/assets/images/sendAddress.svg';

function BroadcastTxnContainer({
  wallet,
  address,
  amount,
  txPrerequisites,
}: {
  wallet: Wallet;
  address: string;
  amount: string;
  txPrerequisites: TransactionPrerequisite;
}) {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const navigation = useNavigation();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [selectedPriority, setSelectedPriority] = React.useState(
    TxPriority.LOW,
  );

  const sendPhaseTwoMutation = useMutation(ApiHandler.sendPhaseTwo);

  useEffect(() => {
    if (sendPhaseTwoMutation.status === 'success') {
      Toast(`Send successful, txid: ${sendPhaseTwoMutation.data}`, true);
      navigation.navigate(NavigationRoutes.WALLETDETAILS, {
        autoRefresh: true,
      });
    } else if (sendPhaseTwoMutation.status === 'error') {
      Toast(`Error while sending: ${sendPhaseTwoMutation.error}`, false, true);
    }
  }, [sendPhaseTwoMutation]);

  const initiateSendPhaseTwo = () => {
    sendPhaseTwoMutation.mutate({
      sender: wallet,
      recipient: {
        address,
        amount: Number(amount),
      },
      txPrerequisites,
      txPriority: selectedPriority,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.txnDetailsContainer}>
          <View style={styles.txnLeftWrapper}>
            <SendAddressIcon />
          </View>
          <View style={styles.txnRightWrapper}>
            <AppText variant="body1" style={styles.sendToAddress}>
              Sending to address
            </AppText>
            <AppText
              variant="body2"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.txnID}>
              {address}
            </AppText>
            <View style={styles.amountWrapper}>
              <IconBitcoin />
              <AppText variant="heading1" style={styles.amountText}>
                {amount} sats
              </AppText>
            </View>
          </View>
        </View>
        <AppText variant="heading1" style={styles.feeTitleText}>
          Total Fee: {txPrerequisites[selectedPriority].fee} t-sats
        </AppText>
        <View style={styles.feeWrapper}>
          <View style={styles.radioBtnWrapper}>
            <RadioButton.Android
              color={theme.colors.accent1}
              uncheckedColor={theme.colors.headingColor}
              value={TxPriority.LOW}
              status={
                selectedPriority === TxPriority.LOW ? 'checked' : 'unchecked'
              }
              onPress={() => setSelectedPriority(TxPriority.LOW)}
            />
            <AppText variant="body2" style={styles.feeText}>
              Low - ({txPrerequisites[TxPriority.LOW].fee} sats)
            </AppText>
          </View>
          <View style={styles.radioBtnWrapper}>
            <RadioButton.Android
              color={theme.colors.accent1}
              uncheckedColor={theme.colors.headingColor}
              value={TxPriority.MEDIUM}
              status={
                selectedPriority === TxPriority.MEDIUM ? 'checked' : 'unchecked'
              }
              onPress={() => setSelectedPriority(TxPriority.MEDIUM)}
            />
            <AppText variant="body2" style={styles.feeText}>
              Medium - ({txPrerequisites[TxPriority.MEDIUM].fee} sats)
            </AppText>
          </View>
          <View style={styles.radioBtnWrapper}>
            <RadioButton.Android
              color={theme.colors.accent1}
              uncheckedColor={theme.colors.headingColor}
              value={TxPriority.HIGH}
              status={
                selectedPriority === TxPriority.HIGH ? 'checked' : 'unchecked'
              }
              onPress={() => setSelectedPriority(TxPriority.HIGH)}
            />
            <AppText variant="body2" style={styles.feeText}>
              High - ({txPrerequisites[TxPriority.HIGH].fee} sats)
            </AppText>
          </View>
        </View>
        <View style={styles.primaryCTAContainer}>
          <Buttons
            primaryTitle={common.broadcast}
            secondaryTitle={common.cancel}
            primaryOnPress={initiateSendPhaseTwo}
            secondaryOnPress={navigation.goBack}
            width={wp(120)}
          />
        </View>
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: '80%',
      width: '100%',
      marginTop: hp(5),
    },
    primaryCTAContainer: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    amountWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    wrapper: {
      flex: 1,
    },
    txnDetailsContainer: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: hp(20),
      alignItems: 'center',
    },
    txnLeftWrapper: {
      width: '20%',
    },
    leftText: {
      backgroundColor: theme.colors.primaryCTA,
      alignItems: 'center',
      justifyContent: 'center',
      height: hp(50),
      width: hp(50),
      borderRadius: hp(50),
    },
    txnRightWrapper: {
      width: '80%',
    },
    sendToAddress: {
      color: theme.colors.headingColor,
    },
    txnID: {
      color: theme.colors.secondaryHeadingColor,
    },
    amountText: {
      marginLeft: hp(5),
      color: theme.colors.headingColor,
    },
    feeWrapper: {
      width: '100%',
      marginVertical: hp(10),
    },
    radioBtnWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(10),
    },
    feeText: {
      color: theme.colors.headingColor,
    },
    feeTitleText: {
      marginTop: hp(20),
      color: theme.colors.headingColor,
    },
  });
export default BroadcastTxnContainer;
