import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import SwipeToAction from 'src/components/SwipeToAction';
import PrimaryCTA from 'src/components/PrimaryCTA';

type sendAssetSuccessProps = {
  assetName: string;
  amount: string;
  feeRate: string;
  onPress: () => void;
  onSuccessStatus: boolean;
  onSuccessPress: () => void;
  selectedPriority: string;
  estimateBlockTime: number;
  // for gas free
  gasFreeFee: string;
  isGasFree: boolean;
  quoteExpiration?: number | null;
  onQuoteExpired?: () => void;
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
    gasFreeFee,
    isGasFree,
    quoteExpiration,
    onQuoteExpired,
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

  // Countdown timer for quote expiration
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isQuoteExpired, setIsQuoteExpired] = useState(false);

  useEffect(() => {
    if (isGasFree && quoteExpiration && !onSuccessStatus) {
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, quoteExpiration - now);
        setTimeRemaining(remaining);

        if (remaining <= 0 && !isQuoteExpired) {
          // Quote expired
          setIsQuoteExpired(true);
          if (onQuoteExpired) {
            onQuoteExpired();
          }
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [isGasFree, quoteExpiration, onSuccessStatus, isQuoteExpired, onQuoteExpired]);

  const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
          <AppText style={styles.labelText}>{isGasFree ? "Service Fee" : sendScreen.feeRate}:</AppText>
        </View>
        <View style={styles.valueWrapper}>
          <AppText style={styles.labelText}>
            {isGasFree ? `${gasFreeFee}` : `${feeRate} sat/vB ~ ${estimateBlockTime * 10} min`}
          </AppText>
        </View>
      </View>
      {isGasFree && timeRemaining !== null && (
        <View style={styles.contentWrapper}>
          <View style={styles.labelWrapper}>
            <AppText style={styles.labelText}>Quote Expires In:</AppText>
          </View>
          <View style={styles.valueWrapper}>
            <AppText style={[styles.labelText, { color: timeRemaining <= 0 ? '#FF6B6B' : timeRemaining < 30000 ? '#FFA500' : theme.colors.headingColor }]}>
              {timeRemaining <= 0 ? 'EXPIRED' : formatTimeRemaining(timeRemaining)}
            </AppText>
          </View>
        </View>
      )}
      <View style={styles.contentWrapper}>
        <View style={styles.labelWrapper}>
          <AppText style={styles.labelText}>
            {walletTranslations.amount}:
          </AppText>
        </View>
        <View style={styles.valueWrapper}>
          <AppText variant="body1" style={styles.valueText}>
            {amount}
          </AppText>
        </View>
      </View>
      <View style={styles.primaryCtaStyle}>
        <SwipeToAction
          title={assets.swipeToSend}
          loadingTitle={assets.sendingAsset}
          onSwipeComplete={onPress}
          backColor={theme.colors.swipeToActionThumbColor}
          loaderTextColor={theme.colors.primaryCTAText}
          disabled={isGasFree && isQuoteExpired}
        />
      </View>
    </View>
  ) : (
    <>
      <LottieView
        source={require('src/assets/images/jsons/nodeConnectSuccess.json')}
        style={styles.loaderStyle}
        autoPlay
        loop={false}
      />
      <View style={{ alignItems: 'center' }}>
        <PrimaryCTA
          title={common.done}
          onPress={onSuccessPress}
          width={'100%'}
          textColor={theme.colors.popupSentCTATitleColor}
          buttonColor={theme.colors.popupSentCTABackColor}
          height={hp(18)}
        />
      </View>
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
      justifyContent: 'flex-end',
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
      width: hp(250),
      height: hp(250),
      marginVertical: hp(20),
    },
  });
export default SendAssetSuccess;
