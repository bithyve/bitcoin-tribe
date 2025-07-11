import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import AppText from './AppText';
import Buttons from './Buttons';
import { hp } from 'src/constants/responsive';
import ResponsePopupContainer from './ResponsePopupContainer';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';

interface Props {
  visible: boolean;
  primaryOnPress: () => void;
  onDismiss?: () => void;
  primaryCtaTitle: string;
}

const DisclaimerPopup: React.FC<Props> = ({
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
            {'Disclaimer: tUSDT Is for Hands-On RGB Testing Only'}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {
              'tUSDT is a demo token issued by Bitcoin Tribe to help users experience RGB mainnet in a real-world, hands-on way.'
            }
          </AppText>
          <View style={styles.infoTextWrapper}>
            <AppText variant="body2" style={styles.infoText}>
              {'\u2022'}
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              {
                'tUSDT is not backed by any real-world asset and holds no monetary value.'
              }
            </AppText>
          </View>
          <View style={styles.infoTextWrapper}>
            <AppText variant="body2" style={styles.infoText}>
              {'\u2022'}
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              {
                'It is intended purely as a test token to explore RGB asset transfers and wallet interactions.'
              }
            </AppText>
          </View>
          <View style={styles.infoTextWrapper}>
            <AppText variant="body2" style={styles.infoText}>
              {'\u2022'}
            </AppText>
            <AppText variant="body2" style={styles.infoText}>
              {
                'Bitcoin Tribe does not hold custody, does not facilitate swaps, and does not guarantee the value or usability of tUSDT beyond this demo.'
              }
            </AppText>
          </View>

          <View>
            <AppText variant="body2" style={styles.infoTitleText}>
              {'You may:'}
            </AppText>
            <View style={styles.infoTextWrapper}>
              <AppText variant="body2" style={styles.infoText}>
                {'\u2022'}
              </AppText>
              <AppText variant="body2" style={styles.infoText}>
                {'Send or receive tUSDT to/from other users.'}
              </AppText>
            </View>
            <View style={styles.infoTextWrapper}>
              <AppText variant="body2" style={styles.infoText}>
                {'\u2022'}
              </AppText>
              <AppText variant="body2" style={styles.infoText}>
                {
                  'Use third-party services (at your own discretion) that recognize tUSDT on RGB.'
                }
              </AppText>
            </View>
          </View>
          <View>
            <AppText variant="body2" style={styles.infoTitleText}>
              {'You acknowledge that:'}
            </AppText>
            <View style={styles.infoTextWrapper}>
              <AppText variant="body2" style={styles.infoText}>
                {'\u2022'}
              </AppText>
              <AppText variant="body2" style={styles.infoText}>
                {
                  'Bitcoin Tribe provides tUSDT as a learning tool, not as a financial product.'
                }
              </AppText>
            </View>
            <View style={styles.infoTextWrapper}>
              <AppText variant="body2" style={styles.infoText}>
                {'\u2022'}
              </AppText>
              <AppText variant="body2" style={styles.infoText}>
                {
                  'All interactions are at your own risk, and Bitcoin Tribe is not liable for any loss, misuse, or third-party behavior related to tUSDT.'
                }
              </AppText>
            </View>
          </View>
        </View>
        <View style={styles.checkIconContainer}>
          <View style={styles.checkIconWrapper}>
            {isThemeDark ? <CheckIcon /> : <CheckIconLight />}
          </View>
          <AppText variant="body2" style={styles.infoText}>
            {'By continuing, you accept these terms'}
          </AppText>
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
      padding: hp(10),
    },
    titleText: {
      color: theme.colors.headingColor,
      textAlign: 'left',
    },
    subTitleText: {
      color: theme.colors.headingColor,
      textAlign: 'left',
      marginTop: hp(10),
      marginBottom: hp(5),
    },
    infoText: {
      color: theme.colors.secondaryHeadingColor,
      marginLeft: hp(5),
      marginVertical: hp(3),
    },
    infoTitleText: {
      marginVertical: hp(3),
      color: theme.colors.headingColor,
    },
    wrapper: {
      marginTop: hp(5),
      marginBottom: hp(10),
    },
    infoTextWrapper: {
      flexDirection: 'row',
      marginHorizontal: hp(5),
      width: '94%',
    },
    checkIconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(20),
      alignSelf: 'flex-start',
    },
    checkIconWrapper: {
      marginRight: hp(3),
    },
  });
export default DisclaimerPopup;
