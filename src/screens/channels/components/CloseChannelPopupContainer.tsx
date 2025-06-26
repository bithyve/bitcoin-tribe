import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ErrorIllustration from 'src/assets/images/errorIllustration.svg';
import PrimaryCTA from 'src/components/PrimaryCTA';

type closeChannelPopupProps = {
  title: string;
  subTitle: string;
  onPress: () => void;
};

function CloseChannelPopupContainer(props: closeChannelPopupProps) {
  const { title, subTitle, onPress } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <ErrorIllustration />
      </View>
      <View style={styles.contentWrapper}>
        <AppText variant="pageTitle2" style={styles.titleText}>{title}</AppText>
        <AppText variant="body1" style={styles.subTitleText}>{subTitle}</AppText>
      </View>
      <View style={styles.wrapper}>
      <PrimaryCTA
        title={common.confirmAndClose}
        onPress={onPress}
        width={hp(220)}
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
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'center',
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
      lineHeight: 20,
    },
    contentWrapper:{
      marginVertical: hp(20),
    },
    wrapper:{
      marginVertical: hp(20),
    },
  });
export default CloseChannelPopupContainer;
