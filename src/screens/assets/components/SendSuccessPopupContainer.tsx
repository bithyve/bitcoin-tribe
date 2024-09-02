import React, { ReactNode, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import PrimaryCTA from 'src/components/PrimaryCTA';
import { hp } from 'src/constants/responsive';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

type sendSuccessProps = {
  icon: ReactNode;
  title: string;
  subTitle: string;
  description: string;
  onPress: () => void;
};

function SendSuccessPopupContainer(props: sendSuccessProps) {
  const { icon, title, subTitle, description, onPress } = props;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <View style={styles.container}>
      <View>{icon}</View>
      <View style={styles.detailsWrapper}>
        <AppText variant="heading2" style={styles.titleText}>
          {title}
        </AppText>
        <AppText variant="body1" style={styles.subTitleText}>
          {subTitle}
        </AppText>
        <AppText variant="body1" style={styles.descriptionText}>
          {description}
        </AppText>
      </View>
      <PrimaryCTA title={common.proceed} onPress={onPress} width={hp(152)} />
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
    },
    descriptionText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
      marginBottom: hp(20),
    },
  });
export default SendSuccessPopupContainer;
