import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import LottieView from 'lottie-react-native';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';

type UseRGBAssetProps = {
  title: string;
  subTitle: string;
  illustrationPath: string;
};

function InProgessPopupContainer(props: UseRGBAssetProps) {
  const { title, subTitle, illustrationPath } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { node } = translations;
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
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
          source={illustrationPath}
          style={styles.loaderStyle}
          autoPlay
          loop
        />
      </View>
      <View style={styles.loaderWrapper}>
        <View style={styles.loaderContentWrapper}>
          <AppText variant="body2" style={styles.loaderMsgText}>
            {node.takeTimeMsg}
          </AppText>
        </View>
        <View style={styles.dotLoaderWrapper}>
          <LottieView
            source={
              isThemeDark
                ? require('src/assets/images/jsons/dotsLoader.json')
                : require('src/assets/images/jsons/dotsLoader_light.json')
            }
            style={styles.dotLoaderStyle}
            autoPlay
            loop
          />
        </View>
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
      marginTop: hp(10),
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
      marginVertical: hp(5),
    },
    illustrationWrapper: {
      marginVertical: hp(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    loaderStyle: {
      alignSelf: 'center',
      width: hp(200),
      height: hp(200),
    },
    loaderWrapper: {
      flexDirection: 'row',
      width: '100%',
      height: hp(90),
      justifyContent: 'space-between',
      marginTop: hp(5),
      alignItems: 'center',
    },
    dotLoaderStyle: {
      alignSelf: 'center',
      width: hp(150),
      height: hp(120),
    },
    loaderMsgText: {
      color: theme.colors.headingColor,
    },
    loaderContentWrapper: {
      width: '55%',
    },
    dotLoaderWrapper: {
      width: '45%',
    },
  });
export default InProgessPopupContainer;
