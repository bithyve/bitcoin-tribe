import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import PullDownIllustration from 'src/assets/images/pullDownIllustration.svg';
import PullDownIllustrationLight from 'src/assets/images/pullDownIllustration_light.svg';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';

interface Props {
  visible: boolean;
  primaryOnPress: () => void;
  primaryCtaTitle: string;
}

const PullDownRefreshInfoModal: React.FC<Props> = ({
  visible,
  primaryOnPress,
  primaryCtaTitle,
}) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { common, settings, home } = translations;

  return (
    <ResponsePopupContainer
      visible={visible}
      enableClose={true}
      backColor={theme.colors.modalBackColor}
      borderColor={theme.colors.modalBackColor}>
      <View style={styles.contentContainer}>
        <View style={styles.wrapper}>
          <AppText
            variant="heading2"
            style={[styles.titleText, styles.titleTextStyle]}>
            {home.pullDownInfo1}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {home.pullDownInfo2}
          </AppText>
        </View>
        <View style={styles.illustrationWrapper}>
          {isThemeDark ? (
            <PullDownIllustration />
          ) : (
            <PullDownIllustrationLight />
          )}
        </View>
        <View style={styles.wrapper1}>
          <AppText
            variant="body1"
            style={[styles.titleText, styles.titleTextStyle]}>
            {home.pullDownInfo3}
          </AppText>
          <View style={styles.contentWrapper}>
            <View style={styles.bulletPointView} />
            <AppText variant="body2" style={styles.subTitleText}>
              {home.pullDownInfo4}
            </AppText>
          </View>
          <View style={styles.contentWrapper}>
            <View style={styles.bulletPointView} />
            <AppText variant="body2" style={styles.subTitleText}>
              {home.pullDownInfo5}
            </AppText>
          </View>
        </View>
        <View style={styles.buttonWrapper}>
          <Buttons
            primaryTitle={primaryCtaTitle}
            primaryOnPress={primaryOnPress}
            height={hp(14)}
            width={wp(130)}
          />
        </View>
      </View>
    </ResponsePopupContainer>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    contentContainer: {},
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'left',
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'left',
    },
    wrapper: {
      marginTop: hp(5),
      marginBottom: hp(20),
    },
    illustrationWrapper: {
      marginVertical: hp(20),
      alignItems: 'center',
    },
    wrapper1: {
      marginVertical: hp(5),
    },
    buttonWrapper: {
      alignSelf: 'flex-end',
      marginTop: hp(10),
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
      marginVertical: hp(2),
    },
    bulletPointView: {
      backgroundColor: theme.colors.headingColor,
      height: hp(6),
      width: hp(6),
      borderRadius: hp(6),
      marginRight: hp(6),
      marginTop: hp(6),
    },
    titleTextStyle: {
      marginBottom: hp(7),
    },
  });
export default PullDownRefreshInfoModal;
