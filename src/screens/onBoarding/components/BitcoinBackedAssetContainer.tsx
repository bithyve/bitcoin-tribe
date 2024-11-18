import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import { hp, windowHeight } from 'src/constants/responsive';
import BtcBackedAsset from 'src/assets/images/BtcBackedAsset.svg';
import AppText from 'src/components/AppText';
import SecondaryCTA from 'src/components/SecondaryCTA';
import PrimaryCTA from 'src/components/PrimaryCTA';

type backedAssetProps = {
  onPrimaryPress: () => void;
  onLaterPress: () => void;
};

function BitcoinBackedAssetContainer({
  onPrimaryPress,
  onLaterPress,
}: backedAssetProps) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  return (
    <>
      <View style={styles.contentWrapper1}>
        <AppText variant="heading1" style={styles.titleText}>
          {onBoarding.btcBackedAssetTitle}
        </AppText>
        <AppText variant="body1" style={styles.subTitleText}>
          {onBoarding.btcBackedAssetSubTitle}
        </AppText>
      </View>
      <View style={styles.illustrationWrapper}>
        <BtcBackedAsset />
      </View>
      <View style={styles.contentWrapper2}>
        <AppText variant="body1" style={styles.infoText}>
          {onBoarding.btcBackedAssetInfo}
        </AppText>
      </View>
      <View style={styles.ctaWrapper}>
        <SecondaryCTA
          onPress={onLaterPress}
          title={common.addFunds}
          width={windowHeight > 670 ? hp(150) : hp(190)}
          height={hp(14)}
        />
        <PrimaryCTA
          title={common.addLater}
          onPress={onPrimaryPress}
          width={windowHeight > 670 ? hp(150) : hp(170)}
          textColor={theme.colors.popupCTATitleColor}
          buttonColor={theme.colors.popupCTABackColor}
          height={hp(14)}
        />
      </View>
    </>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    contentWrapper1: {
      marginVertical: hp(20),
    },
    illustrationWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: hp(20),
    },
    contentWrapper2: {
      marginVertical: hp(20),
      justifyContent: 'center',
    },
    ctaWrapper: {
      flexDirection: 'row',
      marginVertical: hp(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'center',
    },
    subTitleText: {
      textAlign: 'center',
      color: theme.colors.secondaryHeadingColor,
    },
    infoText: {
      textAlign: 'center',
      color: theme.colors.secondaryHeadingColor,
    },
  });
export default BitcoinBackedAssetContainer;
