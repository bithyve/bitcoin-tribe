import LottieView from 'lottie-react-native';
import React, { ReactNode, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import PrimaryCTA from 'src/components/PrimaryCTA';
import { hp } from 'src/constants/responsive';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

type sendSuccessProps = {
  title?: string;
  subTitle?: string;
  description: string;
  onPress: () => void;
};

function RememberPasscode(props: sendSuccessProps) {
  const { title, subTitle, description, onPress } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <View style={styles.container}>
      <View style={styles.detailsWrapper}>
        <AppText variant="heading2" style={styles.titleText}>
          {title}
        </AppText>
        <AppText variant="body1" style={styles.subTitleText}>
          {subTitle}
        </AppText>
      </View>
      <View>
        <LottieView
          source={require('src/assets/images/jsons/rememberPasscode.json')}
          style={styles.loaderStyle}
          autoPlay
          loop
        />
      </View>
      <View style={styles.descWrapper}>
        <AppText variant="body1" style={styles.descriptionText}>
          {description}
        </AppText>
      </View>
      <View style={styles.ctaWrapper}>
        <PrimaryCTA
          title={common.continue}
          onPress={onPress}
          width={hp(120)}
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
      paddingVertical: hp(10),
    },
    detailsWrapper: {
      marginBottom: hp(10),
    },
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'left',
      lineHeight: 30,
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'left',
      lineHeight: 20,
    },
    descWrapper: {
      marginVertical: hp(10),
    },
    descriptionText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'left',
    },
    loaderStyle: {
      alignSelf: 'center',
      width: hp(200),
      height: hp(220),
    },
    ctaWrapper: {
      marginTop: hp(30),
      alignSelf: 'flex-end',
    },
  });
export default RememberPasscode;
