import { useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppText from './AppText';
import SwipeToAction from './SwipeToAction';
import LottieView from 'lottie-react-native';
import Buttons from './Buttons';
import Colors from 'src/theme/Colors';
import { formatNumber } from 'src/utils/numberWithCommas';
import Fonts from 'src/constants/Fonts';

export const CreateCollectionConfirmation = ({
  showSuccess,
  onSwiped,
  closeModal,
  baseFee,
  isVerification,
  verificationFee,
  singleFee = null,
}) => {
  const theme: AppTheme = useTheme();
  const { common, assets } = useContext(LocalizationContext).translations;
  const styles = getStyles(theme);

  const totalFee = useMemo(() => {
    return isVerification ? baseFee + verificationFee : baseFee;
  }, [baseFee, verificationFee]);

  return !showSuccess ? (
    <>
      {singleFee ? (
        <View style={styles.feeParentCtr}>
          <View style={styles.feeTextCtr}>
            <AppText style={styles.feeText}>{singleFee}</AppText>
            <AppText style={styles.feeText}>{`${formatNumber(
              baseFee.toString(),
            )} sats`}</AppText>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.separator} />
          <View style={styles.row}>
            <AppText>{common.baseFee}</AppText>
            <AppText>{`${formatNumber(baseFee.toString())} sats`}</AppText>
          </View>
          {isVerification && (
            <View style={styles.row}>
              <AppText>Verification Fee</AppText>
              <AppText>{formatNumber(verificationFee.toString())} sats</AppText>
            </View>
          )}

          <View style={styles.dotSeparator} />
          <View style={[styles.row, { marginBottom: hp(40) }]}>
            <AppText>Total Fees</AppText>
            <AppText>{`${formatNumber(totalFee.toString())} sats`}</AppText>
          </View>
        </>
      )}

      <SwipeToAction
        title={common.swipeToPay}
        loadingTitle={common.loading}
        onSwipeComplete={onSwiped}
        backColor={theme.colors.swipeToActionThumbColor}
        loaderTextColor={theme.colors.primaryCTAText}
      />
    </>
  ) : (
    <>
      <LottieView
        source={require('src/assets/images/jsons/nodeConnectSuccess.json')}
        style={styles.loader}
        autoPlay
        loop={false}
      />
      <Buttons
        primaryTitle={assets.issueUDA}
        primaryOnPress={() => closeModal('done')}
        secondaryTitle={assets.viewCollection}
        secondaryOnPress={() => closeModal('add')}
        width={windowWidth / 2.7}
        secondaryCTAWidth={windowWidth / 2.7}
        height={hp(14)}
      />
    </>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    separator: {
      height: hp(1),
      backgroundColor: Colors.mediumGray,
      marginBottom: hp(18),
    },
    dotSeparator: {
      width: '100%',
      backgroundColor: Colors.mediumGray,
      marginVertical: hp(10),
      borderStyle: 'dotted',
      borderWidth: 1,
      borderColor: Colors.mediumGray,
      alignSelf: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(13),
    },
    loader: {
      alignSelf: 'center',
      width: hp(250),
      height: hp(250),
      marginVertical: hp(20),
    },
    feeText: {
      fontSize: 14,
      fontWeight: '500',
      fontFamily: Fonts.LufgaMedium,
    },
    feeTextCtr: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: wp(17),
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.mutedTab,
      width: '90%',
    },
    feeParentCtr:{ alignSelf: 'center', marginBottom: hp(35), marginTop:hp(25) }
  });
