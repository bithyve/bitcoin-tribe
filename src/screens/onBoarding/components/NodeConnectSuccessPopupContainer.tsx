import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import LottieView from 'lottie-react-native';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';
import PrimaryCTA from 'src/components/PrimaryCTA';

type nodeConnectSuccessProps = {
  title: string;
  subTitle: string;
  onPress: () => void;
};

function NodeConnectSuccessPopupContainer(props: nodeConnectSuccessProps) {
  const { title, subTitle, onPress } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <View style={styles.container}>
      <View style={styles.detailsWrapper}>
        <AppText variant="heading1" style={styles.titleText}>
          {title}
        </AppText>
        <AppText variant="body1" style={styles.subTitleText}>
          {subTitle}
        </AppText>
      </View>
      <View style={styles.illustrationWrapper}>
        <LottieView
          source={require('src/assets/images/jsons/nodeConnectSuccess.json')}
          style={styles.loaderStyle}
          autoPlay
          loop
        />
      </View>
      <View style={styles.ctaWrapper}>
        <PrimaryCTA
          onPress={onPress}
          title={common.proceed}
          width={hp(150)}
          height={hp(14)}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    detailsWrapper: {
      marginTop: hp(20),
    },
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'center',
      lineHeight: 30,
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
      lineHeight: 20,
      marginVertical: hp(5),
    },
    illustrationWrapper: {
      marginVertical: hp(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    loaderStyle: {
      alignSelf: 'center',
      width: hp(300),
      height: hp(300),
    },
    ctaWrapper: {
      marginBottom: hp(10),
    },
  });
export default NodeConnectSuccessPopupContainer;
