import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useTheme } from 'react-native-paper';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Keys } from 'src/storage';
import { AppTheme } from 'src/theme';
import CommonStyles from 'src/common/styles/CommonStyles';
import CheckIcon from 'src/assets/images/checkIcon.svg';
import CheckIconLight from 'src/assets/images/checkIcon_light.svg';
import Modal from 'react-native-modal';
import WebView from 'react-native-webview';
import PrimaryCTA from 'src/components/PrimaryCTA';
import config from 'src/utils/config';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';

const TncCta = () => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const [showTerms, setShowTerms] = useState(false);
  const styles = React.useMemo(() => getDynamicStyles(theme), [theme]);
  const { onBoarding } = useContext(LocalizationContext).translations;

  return (
    <>
      <View style={styles.tncContainer}>
        <View style={{ marginTop: hp(2) }}>
          {isThemeDark ? (
            <CheckIcon height={20} width={20} />
          ) : (
            <CheckIconLight height={20} width={20} />
          )}
        </View>
        <Text
          onPress={() => setShowTerms(true)}
          style={[
            CommonStyles.body2,
            { color: theme.colors.secondaryHeadingColor, maxWidth:'95%' },
          ]}
          maxFontSizeMultiplier={1}>
          {onBoarding.termsText}
          <Text style={{ color: theme.colors.headingColor }}>
            {onBoarding.termAndConditionTitle}
          </Text>
        </Text>
      </View>
      <Modal isVisible={showTerms} onDismiss={() => setShowTerms(false)}>
        <View style={styles.containerStyle}>
          <WebView
            source={{
              uri: config.TERMS_AND_CONDITIONS_URL[
                theme.dark ? 'dark' : 'light'
              ],
            }}
            style={styles.webViewStyle}
          />
          <PrimaryCTA
            title={'Close'}
            onPress={() => setShowTerms(false)}
            width={windowWidth - hp(50)}
            disabled={false}
            style={{ marginTop: hp(10), alignSelf: 'center' }}
          />
        </View>
      </Modal>
    </>
  );
};

const getDynamicStyles = (theme: AppTheme) =>
  StyleSheet.create({
    containerStyle: {
      height: windowHeight - hp(140),
      width: '100%',
      backgroundColor: theme.colors.modalBackColor,
      padding: hp(5),
      borderRadius: hp(20),
      marginHorizontal: 0,
      marginBottom: 5,
    },
    webViewStyle: {
      flex: 1,
      marginVertical: hp(10),
      backgroundColor: theme.colors.modalBackColor,
      borderRadius: hp(30),
    },
    tncContainer: {
      flexDirection: 'row',
      gap: wp(15),
      justifyContent: 'flex-start',
      alignItems: 'stretch',
    },
  });

export default TncCta;
