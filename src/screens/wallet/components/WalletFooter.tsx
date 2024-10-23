import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppTouchable from 'src/components/AppTouchable';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import LightningActivCTAIcon from 'src/assets/images/lightningActiveCtaIcon.svg';
import LightningInActivCTAIcon from 'src/assets/images/lightningInActiveCtaIcon.svg';
import BtcInActiveCtaIcon from 'src/assets/images/BtcInActiveCtaIcon.svg';
import BtcActiveCtaIcon from 'src/assets/images/BtcActiveCtaIcon.svg';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';

type walletFooterProps = {
  activeTab: string;
  setActiveTab: (text: string) => void;
};

function WalletFooter(props: walletFooterProps) {
  const { activeTab, setActiveTab } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslations } = translations;
  const styles = getStyles(theme, activeTab);

  return (
    <View style={styles.container}>
      <AppTouchable
        style={styles.btcCtaWrapper}
        onPress={() => setActiveTab('bitcoin')}>
        {activeTab === 'bitcoin' ? (
          <BtcActiveCtaIcon />
        ) : (
          <BtcInActiveCtaIcon />
        )}

        <AppText variant="body1" style={styles.btcTitleText}>
          &nbsp;{walletTranslations.bitcoin}
        </AppText>
      </AppTouchable>

      <AppTouchable
        style={styles.lightningCtaWrapper}
        onPress={() => setActiveTab('lightning')}>
        {activeTab === 'lightning' ? (
          <LightningActivCTAIcon />
        ) : (
          <LightningInActivCTAIcon />
        )}

        <AppText variant="body1" style={styles.lightningTitleText}>
          &nbsp;{walletTranslations.lightning}
        </AppText>
      </AppTouchable>
    </View>
  );
}
const getStyles = (theme: AppTheme, activeTab) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
    },
    lightningTitleText: {
      color: activeTab === 'lightning' ? Colors.Black : Colors.DimGray,
    },
    btcTitleText: {
      color: activeTab === 'bitcoin' ? Colors.White : Colors.DimGray,
    },
    lightningCtaWrapper: {
      height: hp(48),
      width: hp(140),
      flexDirection: 'row',
      borderRadius: hp(20),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        activeTab === 'lightning'
          ? theme.colors.lightningCtaBackColor
          : theme.colors.primaryBackground,
      borderColor:
        activeTab === 'lightning'
          ? theme.colors.lightningCtaBackColor
          : theme.colors.borderColor,
      borderWidth: 1,
    },
    btcCtaWrapper: {
      height: hp(48),
      width: hp(140),
      flexDirection: 'row',
      borderRadius: hp(20),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        activeTab === 'bitcoin'
          ? theme.colors.btcCtaBackColor
          : theme.colors.primaryBackground,
      borderColor:
        activeTab === 'bitcoin'
          ? theme.colors.btcCtaBackColor
          : theme.colors.borderColor,
      borderWidth: 1,
    },
  });
export default WalletFooter;
