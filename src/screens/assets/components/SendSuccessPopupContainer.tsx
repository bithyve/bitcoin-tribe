import LottieView from 'lottie-react-native';
import React, { ReactNode, useContext } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import PrimaryCTA from 'src/components/PrimaryCTA';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';

type sendSuccessProps = {
  title: string;
  subTitle?: string;
  description?: string;
  onPress: () => void;
  ctaTitle: string;
  style?: StyleProp<ViewStyle>;
};

function SendSuccessPopupContainer(props: sendSuccessProps) {
  const { title, subTitle, description, onPress, ctaTitle, style } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <View style={styles.container}>
      <View>
        <LottieView
          source={
            isThemeDark
              ? require('src/assets/images/jsons/successPopup.json')
              : require('src/assets/images/jsons/successPopup_light.json')
          }
          style={styles.loaderStyle}
          autoPlay
          loop
        />
      </View>
      <View style={styles.detailsWrapper}>
        <AppText variant="heading2" style={styles.titleText}>
          {title}
        </AppText>
        {subTitle && (
          <AppText variant="body1" style={styles.subTitleText}>
            {subTitle}
          </AppText>
        )}
        {description && (
          <AppText variant="body1" style={styles.descriptionText}>
            {description}
          </AppText>
        )}
      </View>
      <View style={style}>
        <PrimaryCTA
          title={ctaTitle}
          onPress={onPress}
          width={hp(152)}
          textColor={theme.colors.popupCTATitleColor}
          buttonColor={theme.colors.popupCTABackColor}
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
      color: theme.colors.successPopupTitleColor,
      textAlign: 'center',
      lineHeight: 30,
    },
    subTitleText: {
      color: theme.colors.successPopupTitleColor,
      textAlign: 'center',
      lineHeight: 20,
    },
    descriptionText: {
      color: theme.colors.successPopupTitleColor,
      textAlign: 'center',
      marginBottom: hp(20),
    },
    loaderStyle: {
      alignSelf: 'center',
      width: hp(120),
      height: hp(120),
    },
  });
export default SendSuccessPopupContainer;
