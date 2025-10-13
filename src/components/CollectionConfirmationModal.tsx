import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { hp, windowWidth } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppText from './AppText';
import SwipeToAction from './SwipeToAction';
import LottieView from 'lottie-react-native';
import Buttons from './Buttons';
import Colors from 'src/theme/Colors';

export const CreateCollectionConfirmation = ({
  showSuccess,
  setShowSuccess,
  closeModal,
  baseFee,
  total,
  rate
}) => {
  const theme: AppTheme = useTheme();
  const { common } = useContext(LocalizationContext).translations;
  return !showSuccess ? (
    <>
      <View style={styles.separator} />
      <View style={styles.row}>
        <AppText>{common.baseFee}</AppText>
        <AppText>{`${baseFee} ${common.satsPerArt}`}</AppText>
      </View>
      <View style={styles.row}>
        <AppText>{common.totalUda}</AppText>
        <AppText>{total}</AppText>
      </View>
      <View style={[styles.row, { marginBottom: hp(40) }]}>
        <AppText>{common.feeRate}</AppText>
        <AppText>{rate}</AppText>
      </View>

      <SwipeToAction
        title={common.swipeToPay}
        loadingTitle={common.loading}
        onSwipeComplete={() => setShowSuccess(true)}
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
        primaryTitle={common.done}
        primaryOnPress={() => closeModal('done')}
        secondaryTitle={'Add'}
        secondaryOnPress={() => closeModal('add')}
        width={windowWidth / 2.7}
        secondaryCTAWidth={windowWidth / 2.7}
        height={hp(14)}
      />
    </>
  );
};

const styles=
  StyleSheet.create({
    separator: {
      height: hp(1),
      backgroundColor: Colors.mediumGray,
      marginBottom: hp(18),
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
  });
