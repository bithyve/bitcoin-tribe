import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import LottieView from 'lottie-react-native';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import SwipeToAction from 'src/components/SwipeToAction';
import PrimaryCTA from 'src/components/PrimaryCTA';
import { numberWithCommas } from 'src/utils/numberWithCommas';

type sendAssetSuccessProps = {
  assetName: string;
  amount: string;
  feeRate: string;
  onPress: () => void;
  onSuccessStatus: boolean;
  onSuccessPress: () => void;
  selectedPriority: string;
  estimateBlockTime: number;
};
function SendAssetSuccess(props: sendAssetSuccessProps) {
  const {
    assetName,
    amount,
    onPress,
    feeRate,
    onSuccessStatus,
    onSuccessPress,
    selectedPriority,
    estimateBlockTime,
  } = props;

  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const {
    common,
    wallet: walletTranslations,
    sendScreen,
    assets,
  } = translations;

  return !onSuccessStatus ? (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>{'Asset Name'}:</AppText>
        </View>
        <View style={styles.valueWrapper}>
          <AppText style={styles.labelText}>{assetName}</AppText>
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>{sendScreen.feeRate}:</AppText>
        </View>
        <View style={styles.valueWrapper}>
          <AppText style={styles.labelText}>
            {feeRate} sat/vB ~ {estimateBlockTime * 10} {'min'}
          </AppText>
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>
            {walletTranslations.amount}:
          </AppText>
        </View>
        <View style={styles.valueWrapper}>
          <AppText variant="body1" style={styles.valueText}>
            {numberWithCommas(amount)}
          </AppText>
        </View>
      </View>
      <View style={styles.primaryCtaStyle}>
        <SwipeToAction
          title={assets.swipeToSend}
          loadingTitle={assets.sendingAsset}
          onSwipeComplete={onPress}
          backColor={theme.colors.swipeToActionThumbColor}
        />
      </View>
    </View>
  ) : (
    <>
      <LottieView
        source={require('src/assets/images/jsons/nodeConnectSuccess.json')}
        style={styles.loaderStyle}
        autoPlay
        loop
      />
      <PrimaryCTA
        title={common.done}
        onPress={onSuccessPress}
        width={'100%'}
        textColor={theme.colors.popupSentCTATitleColor}
        buttonColor={theme.colors.popupSentCTABackColor}
        height={hp(18)}
      />
    </>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      borderTopColor: theme.colors.borderColor,
      borderTopWidth: 1,
      paddingTop: 15,
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginVertical: hp(10),
    },
    labelWrapper: {
      width: '45%',
    },
    valueWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '55%',
    },
    labelText: {
      color: theme.colors.headingColor,
    },
    valueText: {
      color: theme.colors.headingColor,
    },
    primaryCtaStyle: {
      marginTop: hp(30),
    },
    loaderStyle: {
      alignSelf: 'center',
      width: hp(150),
      height: hp(150),
      marginVertical: hp(20),
    },
  });
export default SendAssetSuccess;
