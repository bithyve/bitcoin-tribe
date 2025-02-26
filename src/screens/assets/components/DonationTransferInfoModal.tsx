import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import DonationTransIllustration from 'src/assets/images/donationTranferIllustration.svg';
import DonationTransIllustrationLight from 'src/assets/images/donationTranferIllustration_light.svg';
import { hp, wp } from 'src/constants/responsive';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import AppText from 'src/components/AppText';
import Buttons from 'src/components/Buttons';

interface Props {
  visible: boolean;
  primaryOnPress: () => void;
  primaryCtaTitle: string;
}

const DonationTransferInfoModal: React.FC<Props> = ({
  visible,
  primaryOnPress,
  primaryCtaTitle,
}) => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { assets } = translations;

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
            {assets.donationTranferInfo1}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {assets.donationTranferInfo2}
          </AppText>
        </View>
        <View style={styles.illustrationWrapper}>
          {isThemeDark ? (
            <DonationTransIllustration />
          ) : (
            <DonationTransIllustrationLight />
          )}
        </View>
        <View style={styles.wrapper1}>
          <AppText variant="body2" style={styles.titleText}>
            {assets.donationTranferInfo3}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {assets.donationTranferInfo4}
          </AppText>
        </View>
        <View style={styles.wrapper1}>
          <AppText variant="body2" style={styles.titleText}>
            {assets.donationTranferInfo5}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {assets.donationTranferInfo6}
          </AppText>
        </View>
        <View style={styles.wrapper1}>
          <AppText variant="body2" style={styles.titleText}>
            {assets.donationTranferInfo7}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {assets.donationTranferInfo8}
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
    titleTextStyle: {
      marginBottom: hp(5),
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
      marginTop: hp(15),
    },
  });
export default DonationTransferInfoModal;
