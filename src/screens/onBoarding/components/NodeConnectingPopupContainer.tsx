import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import LottieView from 'lottie-react-native';

import AppText from 'src/components/AppText';
import NodeConnectingIllustration from 'src/assets/images/nodeConnecting.svg';
import { hp } from 'src/constants/responsive';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';

type UseRGBAssetProps = {
  title: string;
  subTitle: string;
};

function NodeConnectingPopupContainer(props: UseRGBAssetProps) {
  const { title, subTitle } = props;
  const theme: AppTheme = useTheme();
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
          source={require('src/assets/images/nodeConnecting.json')}
          style={styles.loaderStyle}
          autoPlay
          loop
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
      marginVertical: hp(20),
      alignItems: 'center',
      justifyContent: 'center',
    },
    loaderStyle: {
      alignSelf: 'center',
      width: hp(350),
      height: hp(350),
    },
  });
export default NodeConnectingPopupContainer;
