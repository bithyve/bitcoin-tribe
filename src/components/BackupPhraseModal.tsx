import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import BackupPhraseIllustration from 'src/assets/images/backupPhraseIllustration.svg';
import AppText from './AppText';
import Buttons from './Buttons';
import { hp, windowWidth } from 'src/constants/responsive';
import ResponsePopupContainer from './ResponsePopupContainer';

interface Props {
  visible: boolean;
  primaryOnPress: () => void;
  onDismiss?: () => void;
}

const BackupPhraseModal: React.FC<Props> = ({
  visible,
  primaryOnPress,
  onDismiss,
}) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;

  return (
    <ResponsePopupContainer
      visible={visible}
      enableClose={true}
      backColor={theme.colors.modalBackColor}
      borderColor={theme.colors.modalBackColor}>
      <View style={styles.contentContainer}>
        <View style={styles.wrapper}>
          <AppText variant="heading2" style={styles.titleText}>
            {settings.backupPhraseTitle}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {settings.backupPhraseSubTitle}
          </AppText>
        </View>
        <View style={styles.illustrationWrapper}>
          <BackupPhraseIllustration />
        </View>
        <View style={styles.wrapper1}>
          <AppText variant="heading3" style={styles.titleText}>
            {settings.backupPhraseTitle1}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {settings.backupPhraseSubTitle1}
          </AppText>
        </View>
        <Buttons
          primaryTitle={common.next}
          primaryOnPress={primaryOnPress}
          secondaryTitle={common.cancel}
          secondaryOnPress={onDismiss}
          width={windowWidth / 2.7}
          secondaryCTAWidth={windowWidth / 2.7}
        />
      </View>
    </ResponsePopupContainer>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    contentContainer: {
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
      marginHorizontal: hp(15),
    },
    wrapper: {
      marginTop: hp(5),
      marginBottom: hp(20),
    },
    illustrationWrapper: {
      marginVertical: hp(20),
    },
    wrapper1: {
      marginTop: hp(20),
      marginBottom: hp(25),
    },
  });
export default BackupPhraseModal;
