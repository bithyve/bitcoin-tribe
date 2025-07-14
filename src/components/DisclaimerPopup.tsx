import { Dimensions, StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import RenderHTML from 'react-native-render-html';

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
  disclaimerHtml: string;
}

const DisclaimerPopup: React.FC<Props> = ({
  visible,
  primaryOnPress,
  onDismiss,
  primaryCtaTitle,
  disclaimerHtml,
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
          <RenderHTML
            contentWidth={Dimensions.get('window').width - hp(20)}
            source={{ html: disclaimerHtml }}
          />
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
    infoText: {
      color: theme.colors.secondaryHeadingColor,
      marginLeft: hp(5),
    },
    wrapper: {},
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
