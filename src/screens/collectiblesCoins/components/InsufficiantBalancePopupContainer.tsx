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
  secondaryOnPress: () => void;
};
function InsufficiantBalancePopupContainer(props: insufficientBalanceProps) {
  const { primaryOnPress, secondaryOnPress } = props;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;
  const styles = getStyles(theme);
  return (
    <View>
      <View style={styles.infoWrapper}>
        <AppText variant="heading1" style={styles.headerText}>
          {assets.insufficientBalance}
        </AppText>
        <AppText variant="body1" style={styles.subTitleText}>
          {assets.insufficientBalanceSubtitle}
        </AppText>
      </View>
      <View style={styles.ctaWrapper}>
        <Buttons
          primaryTitle={common.addFunds}
          primaryOnPress={primaryOnPress}
          secondaryTitle={common.cancel}
          secondaryOnPress={secondaryOnPress}
          width={wp(155)}
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
      marginRight: hp(15),
    },
  });
export default InsufficiantBalancePopupContainer;
