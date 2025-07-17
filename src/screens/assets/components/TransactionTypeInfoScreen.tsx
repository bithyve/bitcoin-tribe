import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

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
import FailedTxnIcon from 'src/assets/images/failedTxnIcon.svg';
import WaitingConfirmationIconSend from 'src/assets/images/waitingConfirmationIconSend.svg';
import WaitingConfirmationIconReceive from 'src/assets/images/waitingConfirmationIconReceive.svg';
import ServiceFeeIcon from 'src/assets/images/serviceFeeIcon.svg';
import ServiceFeeIconLight from 'src/assets/images/serviceFeeIcon_light.svg';
import { Keys } from 'src/storage';

function TransactionTypeInfoScreen() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  return (
    <ScreenContainer>
      <AppHeader title={assets.txnInfoTitle} enableBack={true} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.spendableInfoView}>
          <AppText variant="body1" style={styles.titleText}>
            {assets.spendableTitle}
          </AppText>
          <AppText variant="body2" style={styles.infoText}>
            {assets.spendableSubTitle}
          </AppText>
        </View>
        <View style={styles.txnTypesWrapper}>
          <AppText variant="body1" style={styles.titleText}>
            {assets.txnTypeInfoTitle}
          </AppText>
          <AppText variant="body2" style={styles.infoText}>
            {assets.txnTypeInfoSubTitle}
          </AppText>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <IssuanceIcon />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {assets.issuedTitle}
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              {assets.issuedSubTitle}
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <SentBtcIcon />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {assets.sendTitle}
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              {assets.sendSubTitle}
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <RecieveBtcIcon />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {assets.receiveTitle}
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              {assets.receiveSubTitle}
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <WaitingConfirmationIconSend />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {assets.waitingConfirmationTitle}
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              {assets.waitingConfirmationSubTitle}
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <WaitingConfirmationIconReceive />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {assets.waitingConfirmationTitle1}
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              {assets.waitingConfirmationSubTitle1}
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <WaitingCounterPartySendIcon />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {assets.waitingVerificationTitle}
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              {assets.waitingVerificationSubTitle}
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            <FailedTxnIcon />
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {assets.failedTitle}
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              {assets.failedSubTitle}
            </AppText>
          </View>
        </View>
        <View style={styles.txnInfoContainer}>
          <View style={styles.txnIconWrapper}>
            {isThemeDark ? <ServiceFeeIcon /> : <ServiceFeeIconLight />}
          </View>
          <View style={styles.txnInfoWrapper}>
            <AppText variant="body1" style={styles.titleText}>
              {assets.platformFeeTitle}
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              {assets.platformFeeSubTitle}
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
      lineHeight: 25,
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
