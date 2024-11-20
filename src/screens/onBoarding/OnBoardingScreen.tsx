import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ScreenContainer from 'src/components/ScreenContainer';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { useNavigation } from '@react-navigation/native';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import BtcBackedAsset from 'src/assets/images/BtcBackedAsset.svg';
import AppText from 'src/components/AppText';
import { Keys, Storage } from 'src/storage';

function OnBoardingScreen() {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { onBoarding, common } = translations;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  return (
    <ScreenContainer>
      <View style={styles.contentWrapper1}>
        <AppText variant="heading1" style={styles.titleText}>
          {onBoarding.btcBackedAssetTitle}
        </AppText>
        <AppText variant="heading3" style={styles.subTitleText}>
          {onBoarding.btcBackedAssetSubTitle}
        </AppText>
      </View>
      <View style={styles.illustrationWrapper}>
        <BtcBackedAsset />
      </View>
      <View style={styles.contentWrapper2}>
        <AppText variant="heading3" style={styles.infoText}>
          {onBoarding.btcBackedAssetInfo}
        </AppText>
      </View>
      <View style={styles.ctaWrapper}>
        <Buttons
          primaryTitle={common.addFunds}
          primaryOnPress={() => {
            Storage.set(Keys.BACKUPALERT, true);
            navigation.replace(NavigationRoutes.APPSTACK, {
              screen: NavigationRoutes.RECEIVESCREEN,
            });
          }}
          secondaryTitle={common.addLater}
          secondaryOnPress={() => {
            Storage.set(Keys.BACKUPALERT, true);
            navigation.replace(NavigationRoutes.APPSTACK);
          }}
          disabled={false}
          width={wp(130)}
        />
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    contentWrapper1: {
      marginVertical: hp(20),
      paddingTop: hp(20),
      height: '20%',
    },
    illustrationWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      height: '40%',
    },
    contentWrapper2: {
      height: '20%',
      marginVertical: hp(20),
      justifyContent: 'center',
    },
    ctaWrapper: {
      marginVertical: hp(10),
    },
    titleText: {
      fontSize: 30,
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
export default OnBoardingScreen;
