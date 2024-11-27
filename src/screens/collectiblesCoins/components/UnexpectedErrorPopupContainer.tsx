import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import { hp, wp } from 'src/constants/responsive';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
type insufficientBalanceProps = {
  primaryOnPress: () => void;
};
function UnexpectedErrorPopupContainer(props: insufficientBalanceProps) {
  const { primaryOnPress } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;
  const styles = getStyles(theme);
  return (
    <View>
      <View style={styles.infoWrapper}>
        <AppText variant="heading1" style={styles.headerText}>
          {assets.unexpectedErrorTitle}
        </AppText>
        <AppText variant="body1" style={styles.subTitleText}>
          {assets.unexpectedErrorSubTitle}
        </AppText>
      </View>
      <View style={styles.ctaWrapper}>
        <Buttons
          primaryTitle={common.ok}
          primaryOnPress={primaryOnPress}
          width={wp(120)}
          height={hp(14)}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    infoWrapper: {
      marginTop: hp(10),
      marginBottom: hp(20),
    },
    headerText: {
      color: theme.colors.headingColor,
      marginBottom: hp(10),
      textAlign: 'center',
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
      marginBottom: hp(30),
    },
    ctaWrapper: {
      alignSelf: 'center',
    },
  });
export default UnexpectedErrorPopupContainer;
