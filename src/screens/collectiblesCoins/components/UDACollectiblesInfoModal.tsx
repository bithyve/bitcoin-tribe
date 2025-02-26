import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { Text, useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import UDACollectibleInfoIllustration from 'src/assets/images/UDACollectiblesIllustration.svg';
import UDACollectibleInfoIllustrationLight from 'src/assets/images/UDACollectiblesIllustration_light.svg';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import CommonStyles from 'src/common/styles/CommonStyles';

interface Props {
  visible: boolean;
  primaryOnPress: () => void;
  primaryCtaTitle: string;
}

const UDACollectiblesInfoModal: React.FC<Props> = ({
  visible,
  primaryOnPress,
  primaryCtaTitle,
}) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { common, assets } = translations;

  return (
    <ResponsePopupContainer
      visible={visible}
      enableClose={true}
      backColor={theme.colors.modalBackColor}
      borderColor={theme.colors.modalBackColor}>
      <View style={styles.contentContainer}>
        <View style={styles.wrapper}>
          <AppText variant="heading2" style={styles.titleText}>
            {assets.udaCollectibleInfo1}
          </AppText>
          <Text style={[styles.infoText, CommonStyles.body2, styles.wrapper1]}>
            <Text style={[styles.infoText, styles.bold]}>
              {assets.udaCollectibleInfoBold}
            </Text>
            {assets.udaCollectibleInfo2}
          </Text>

          <Text style={[styles.infoText, CommonStyles.body2]}>
            <Text style={[styles.infoText, styles.bold]}>
              {assets.udaCollectibleInfoBold1}
            </Text>
            {assets.udaCollectibleInfo3}
          </Text>
        </View>
        <View style={styles.illustrationWrapper}>
          {isThemeDark ? (
            <UDACollectibleInfoIllustration />
          ) : (
            <UDACollectibleInfoIllustrationLight />
          )}
        </View>
        <View style={styles.wrapper1}>
          <AppText variant="body1" style={[styles.titleText, styles.bold]}>
            {assets.udaCollectibleInfo4}
          </AppText>
          <Text style={[styles.infoText, CommonStyles.body2, styles.wrapper1]}>
            <Text style={[styles.infoText, styles.bold]}>
              {assets.udaCollectibleInfoBold2}
            </Text>
            {assets.udaCollectibleInfo5}
          </Text>
          <Text style={[styles.infoText, CommonStyles.body2]}>
            <Text style={[styles.infoText, styles.bold]}>
              {assets.udaCollectibleInfoBold3}
            </Text>
            {assets.udaCollectibleInfo6}
          </Text>
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
    infoText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'left',
    },
    bold: {
      fontWeight: '500',
      color: theme.colors.headingColor,
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
    infoWrapper: {
      flexDirection: 'row',
    },
    buttonWrapper: {
      alignSelf: 'flex-end',
      marginTop: hp(10),
    },
  });
export default UDACollectiblesInfoModal;
