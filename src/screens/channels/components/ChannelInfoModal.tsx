import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { Text, useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import ChannelInfoIllustration from 'src/assets/images/channelsInfoIllustration.svg';
import ChannelInfoIllustrationLight from 'src/assets/images/channelsInfoIllustration_light.svg';
import { hp, wp } from 'src/constants/responsive';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';
import CommonStyles from 'src/common/styles/CommonStyles';

interface Props {
  visible: boolean;
  primaryOnPress: () => void;
  primaryCtaTitle: string;
}

const ChannelInfoModal: React.FC<Props> = ({
  visible,
  primaryOnPress,
  primaryCtaTitle,
}) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { channel: channelTranslations } = translations;

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
            {channelTranslations.channelInfo1}
          </AppText>
          <Text style={[styles.infoText, CommonStyles.body2, styles.wrapper1]}>
            {channelTranslations.channelInfo2}
          </Text>
        </View>
        <View style={styles.illustrationWrapper}>
          {isThemeDark ? (
            <ChannelInfoIllustration />
          ) : (
            <ChannelInfoIllustrationLight />
          )}
        </View>
        <View style={styles.wrapper1}>
          <AppText
            variant="body2"
            style={[styles.titleText, styles.titleTextStyle]}>
            {channelTranslations.channelInfo3}
          </AppText>
          <Text style={[styles.infoText, CommonStyles.body2, styles.wrapper1]}>
            <Text style={[styles.infoText, styles.bold]}>
              {channelTranslations.channelInfoBold1}
            </Text>
            {channelTranslations.channelInfo4}
          </Text>
          <Text style={[styles.infoText, CommonStyles.body2]}>
            <Text style={[styles.infoText, styles.bold]}>
              {channelTranslations.channelInfoBold2}
            </Text>
            {channelTranslations.channelInfo5}
          </Text>
          <Text style={[styles.infoText, CommonStyles.body2, styles.wrapper1]}>
            <Text style={[styles.infoText, styles.bold]}>
              {channelTranslations.channelInfoBold3}
            </Text>
            {channelTranslations.channelInfo6}
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
    titleTextStyle: {
      marginVertical: hp(5),
    },
  });
export default ChannelInfoModal;
