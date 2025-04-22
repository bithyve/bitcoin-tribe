import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import AssetRegisterIllustration from 'src/assets/images/assetRegisterIllustration.svg';
import { hp, windowWidth } from 'src/constants/responsive';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';

interface Props {
  visible: boolean;
  primaryOnPress: () => void;
  onDismiss?: () => void;
  primaryCtaTitle: string;
}

const AssetRegisterModal: React.FC<Props> = ({
  visible,
  primaryOnPress,
  onDismiss,
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
            {'Why Registry is important?'}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {
              "Registering your asset adds it to the official Bitcoin Tribe registry - proving it's genuine owned by you and secured on-chain. not ready to register? You can skip registry and still post about it on Twitter"
            }
          </AppText>
        </View>
        <View style={styles.illustrationWrapper}>
          <AssetRegisterIllustration />
        </View>
        <Buttons
          primaryTitle={primaryCtaTitle}
          primaryOnPress={primaryOnPress}
          secondaryTitle={common.skip}
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
      marginVertical: hp(25),
    },
  });
export default AssetRegisterModal;
