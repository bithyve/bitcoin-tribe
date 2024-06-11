import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TouchableRipple, useTheme } from 'react-native-paper';

import { hp, wp } from 'src/constants/responsive';
import CommonStyles from 'src/common/styles/CommonStyles';
import AppText from './AppText';

type PrimaryCTAProps = {
  primaryOnPress: any;
  secondaryOnPress?: any;
  primaryTitle: string;
  width?: any;
  style?: any;
  secondaryTitle?: string;
};

function PrimaryCTA(props: PrimaryCTAProps) {
  const {
    primaryOnPress,
    primaryTitle,
    width,
    secondaryTitle,
    secondaryOnPress,
  } = props;
  const theme = useTheme();
  const styles = getStyles(theme, width);
  return (
    <View style={styles.container}>
      {secondaryTitle && (
        <TouchableRipple onPress={secondaryOnPress}>
          <AppText
            variant="secondaryCTATitle"
            style={styles.seconadryTitleStyle}>
            {secondaryTitle}
          </AppText>
        </TouchableRipple>
      )}
      <Button
        mode="contained"
        uppercase={false}
        labelStyle={[CommonStyles.primaryCTATitle, styles.labelStyle]}
        style={styles.ctaContainerStyle}
        buttonColor={theme.colors.primaryCTA}
        onPress={primaryOnPress}>
        {primaryTitle}
      </Button>
    </View>
  );
}
const getStyles = (theme, width) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    seconadryTitleStyle: {
      color: theme.colors.primaryCTA,
      marginRight: wp(10),
    },
    ctaContainerStyle: {
      borderRadius: 10,
      marginVertical: hp(20),
      width: width,
    },
    labelStyle: {
      minWidth: wp(120),
      marginVertical: hp(14),
    },
  });
export default PrimaryCTA;
