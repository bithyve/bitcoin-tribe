import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import UTXOInfoIllustration from 'src/assets/images/utxoInfoIllustration.svg';
import UTXOInfoIllustrationLight from 'src/assets/images/utxoInfoIllustration_light.svg';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';

interface Props {
  visible: boolean;
  primaryOnPress: () => void;
  primaryCtaTitle: string;
}

const UTXOInfoModal: React.FC<Props> = ({
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
            {settings.utxoInfoTitle1}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {settings.utxoInfoSubTitle1}
          </AppText>
        </View>
        <View style={styles.illustrationWrapper}>
          {isThemeDark ? (
            <UTXOInfoIllustration />
          ) : (
            <UTXOInfoIllustrationLight />
          )}
        </View>
        <View style={styles.wrapper1}>
          <AppText variant="heading3" style={styles.titleText}>
            {settings.utxoInfoTitle2}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {settings.utxoInfoSubTitle2}
          </AppText>
        </View>
        <View style={styles.wrapper1}>
          <AppText variant="heading3" style={styles.titleText}>
            {settings.utxoInfoTitle3}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {settings.utxoInfoSubTitle3}
          </AppText>
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
  });
export default UTXOInfoModal;
