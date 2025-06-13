import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppHeader from 'src/components/AppHeader';
import AppText from 'src/components/AppText';
import ScreenContainer from 'src/components/ScreenContainer';
import { hp, windowHeight } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import IssuanceIcon from 'src/assets/images/issuanceIcon.svg';
import SentBtcIcon from 'src/assets/images/btcSentAssetTxnIcon.svg';
import RecieveBtcIcon from 'src/assets/images/btcReceiveAssetTxnIcon.svg';
import WaitingCounterPartySendIcon from 'src/assets/images/waitingCounterPartySendIcon.svg';
import WaitingCounterPartyReceiveIcon from 'src/assets/images/waitingCounterPartyReceiveIcon.svg';
import FailedTxnIcon from 'src/assets/images/failedTxnIcon.svg';
import WaitingConfirmationIconSend from 'src/assets/images/waitingConfirmationIconSend.svg';
import WaitingConfirmationIconReceive from 'src/assets/images/waitingConfirmationIconReceive.svg';

function TransactionTypeInfoScreen() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const styles = getStyles(theme);
  return (
    <ScreenContainer>
      <AppHeader title={'Info'} enableBack={true} />
      <ScrollView>
        <View style={styles.spendableInfoView}>
          <AppText variant="body1" style={styles.titleText}>
            Spendable
          </AppText>
          <AppText variant="body2" style={styles.infoText}>
            Spendable balance is the amount available after subtracting assets
            locked in pending or ‘waiting counterparty’ transactions.
          </AppText>
        </View>
        <View style={styles.txnTypesWrapper}>
          <AppText variant="body1" style={styles.titleText}>
            Transaction Types Info
          </AppText>
          <AppText variant="body2" style={styles.infoText}>
            Understand what each transaction type means and how it works.
          </AppText>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <IssuanceIcon />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              Issued
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              A new asset has been created or assigned to your wallet. It’s now
              available for use.
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <SentBtcIcon />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              Send
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              Asset sent successfully. Awaiting receiver’s confirmation to
              finalize the transfer.
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <RecieveBtcIcon />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              Receive
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              Asset received and added to your wallet. You can now view and use
              it from your assets list.
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <WaitingConfirmationIconSend />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              Waiting Confirmation
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              Assets are incoming. Waiting for your confirmation to complete the
              transfer.
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <WaitingConfirmationIconReceive />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              Waiting Confirmation
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              You sent assets. Waiting for the receiver to confirm and finalize
              the transfer.
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <WaitingCounterPartySendIcon />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              Waiting Verification
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              Transaction is under verification. Processing will continue once
              checks are complete.
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <FailedTxnIcon />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              Failed
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              Transaction was unsuccessful. No funds were moved.
            </AppText>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    spendableInfoView: {
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 1,
      marginVertical: hp(15),
      paddingBottom: hp(20),
    },
    titleText: {
      color: theme.colors.headingColor,
      fontWeight: '500',
    },
    infoText: {
      color: theme.colors.secondaryHeadingColor,
    },
    txnInfoContainer: {
      flexDirection: 'row',
      width: '100%',
      marginVertical: hp(5),
    },
    txnIconWrapper: {
      width: '15%',
    },
    txnInfoWrapper: {
      width: '85%',
    },
    txnTypesWrapper: {
      marginTop: hp(10),
      marginBottom: hp(15),
    },
  });
export default TransactionTypeInfoScreen;
