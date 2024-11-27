import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import RequestTSatsIllustration from 'src/assets/images/requestTSats.svg';
import AppText from 'src/components/AppText';
import PrimaryCTA from 'src/components/PrimaryCTA';
import SecondaryCTA from 'src/components/SecondaryCTA';
import { hp, windowHeight } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

type RequestTSatsModalProps = {
  title: string;
  subTitle: string;
  onLaterPress: () => void;
  onPrimaryPress: () => void;
};
function RequestTSatsModal(props: RequestTSatsModalProps) {
  const { title, subTitle, onLaterPress, onPrimaryPress } = props;
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View>
        <AppText variant="heading1" style={styles.titleText}>
          {title}
        </AppText>
        <AppText variant="body1" style={styles.subTitleText}>
          {subTitle}
        </AppText>
      </View>
      <View style={styles.illustrationWrapper}>
        <RequestTSatsIllustration />
      </View>
      <View style={styles.ctaWrapper}>
        <SecondaryCTA
          onPress={onLaterPress}
          title={common.later}
          width={windowHeight > 670 ? hp(100) : hp(150)}
          height={hp(14)}
        />
        <PrimaryCTA
          title={common.joinGroup}
          onPress={onPrimaryPress}
          width={windowHeight > 670 ? hp(140) : hp(180)}
          textColor={theme.colors.popupCTATitleColor}
          buttonColor={theme.colors.popupCTABackColor}
          height={hp(14)}
        />
      </View>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginVertical: hp(15),
    },
    illustrationWrapper: {
      alignSelf: 'center',
      marginVertical: hp(25),
    },
    ctaWrapper: {
      flexDirection: 'row',
      marginTop: hp(15),
      marginRight: hp(10),
    },
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'center',
      marginBottom: hp(5),
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
    },
  });
export default RequestTSatsModal;
