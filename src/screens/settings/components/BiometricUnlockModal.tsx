import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import BioUnlockIllustration from 'src/assets/images/biometricUnlockIllustration.svg';
import BioUnlockIllustrationLight from 'src/assets/images/biometricUnlockIllustration_light.svg';
import { hp } from 'src/constants/responsive';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';

interface Props {
  visible: boolean;
  primaryOnPress: () => void;
  primaryCtaTitle: string;
}

const BiometricUnlockModal: React.FC<Props> = ({
  visible,
  primaryOnPress,
  primaryCtaTitle,
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
            {settings.bioUnlockTitle}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {settings.bioUnlockSubTitle}
          </AppText>
        </View>
        <View style={styles.illustrationWrapper}>
          {isThemeDark ? (
            <BioUnlockIllustration />
          ) : (
            <BioUnlockIllustrationLight />
          )}
        </View>
        <Buttons
          primaryTitle={primaryCtaTitle}
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
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'left',
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'left',
      marginTop: hp(3),
    },
    wrapper: {
      marginTop: hp(5),
      marginBottom: hp(20),
    },
    illustrationWrapper: {
      marginVertical: hp(25),
    },
  });
export default BiometricUnlockModal;
