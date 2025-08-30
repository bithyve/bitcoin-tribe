import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import DomainAndXInfoIllustration from 'src/assets/images/DomainAndXInfoIllustration.svg';
import { hp, windowWidth } from 'src/constants/responsive';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';

interface Props {
  visible: boolean;
  primaryOnPress: () => void;
}

const DomainVerificationInfoModal: React.FC<Props> = ({
  visible,
  primaryOnPress,
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
            {assets.domainVerificationTitle}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {assets.domainVerificationSubTitle}
          </AppText>
        </View>
        <View style={styles.illustrationWrapper}>
          <DomainAndXInfoIllustration />
        </View>
        <View style={styles.wrapper1}>
          <AppText variant="heading3" style={styles.titleText}>
            {assets.domainVerificationInfoTitle1}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {assets.domainVerificationInfoSubTitle1}
          </AppText>
        </View>
        <View style={styles.wrapper1}>
          <AppText variant="heading3" style={styles.titleText}>
            {assets.domainVerificationInfoTitle2}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {assets.domainVerificationInfoSubTitle2}
          </AppText>
        </View>
        <View style={[styles.wrapper1, styles.wrapper2]}>
          <AppText variant="heading3" style={styles.titleText}>
            {assets.domainVerificationInfoTitle3}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {assets.domainVerificationInfoSubTitle3}
          </AppText>
        </View>
        <Buttons
          primaryTitle={common.okay}
          primaryOnPress={primaryOnPress}
          width={'100%'}
          height={hp(14)}
        />
      </View>
    </ResponsePopupContainer>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    contentContainer: {
      marginHorizontal: hp(5),
    },
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
      alignSelf: 'center',
    },
    wrapper1: {
      marginVertical: hp(5),
    },
    wrapper2: {
      marginBottom: hp(12),
    },
  });
export default DomainVerificationInfoModal;
