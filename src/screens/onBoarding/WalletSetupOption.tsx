import React, { useContext, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from 'src/components/OptionCard';
import IconWallet from 'src/assets/images/icon_wallet1.svg';
import IconWalletLight from 'src/assets/images/icon_wallet1_light.svg';
import IconRecovery from 'src/assets/images/icon_recoveryphrase.svg';
import IconRecoveryLight from 'src/assets/images/icon_recoveryphrase_light.svg';
import { hp, windowHeight, windowWidth } from 'src/constants/responsive';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppText from 'src/components/AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import UseRGBAssetPopupContainer from './components/UseRGBAssetPopupContainer';
import config, { APP_STAGE } from 'src/utils/config';
import WebView from 'react-native-webview';
import Modal from 'react-native-modal';
import PrimaryCTA from 'src/components/PrimaryCTA';

function WalletSetupOption({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;

  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [visible, setVisible] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const onPressCreateNew = () => {
    if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
      navigation.navigate(NavigationRoutes.SELECTWALLET);
    } else {
      setShowTermsModal(true);
    }
  };

  return (
    <ScreenContainer>
      <AppText variant="pageTitle1" style={styles.title}>
        {onBoarding.walletSetupTitle}
      </AppText>
      <OptionCard
        icon={isThemeDark ? <IconWallet /> : <IconWalletLight />}
        title={onBoarding.createNew}
        subTitle={onBoarding.createNewSubTitle}
        showRightArrow={true}
        onPress={()=>setShowTermsModal(true)}
        style={styles.optionCardStyle}
      />
      <OptionCard
        icon={isThemeDark ? <IconRecovery /> : <IconRecoveryLight />}
        title={onBoarding.recoveryPhrase}
        subTitle={onBoarding.recoveryPhraseSubTitle}
        showRightArrow={true}
        onPress={() => navigation.navigate(NavigationRoutes.ENTERSEEDSCREEN)}
        style={styles.optionCardStyle}
      />

      <Modal
        isVisible={showTermsModal}
        onDismiss={() => setShowTermsModal(false)}>
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
            title={'I agree'}
            onPress={() => {
              setShowTermsModal(false);
              navigation.navigate(NavigationRoutes.PROFILESETUP);
            }}
            width={windowWidth - hp(50)}
            disabled={false}
            style={{ marginTop: hp(10), alignSelf: 'center' }}
          />
        </View>
      </Modal>
      <ResponsePopupContainer
        visible={visible}
        enableClose={true}
        backColor={theme.colors.modalBackColor}
        borderColor={theme.colors.modalBackColor}>
        <UseRGBAssetPopupContainer
          title={onBoarding.useRGBAssetTitle}
          subTitle={onBoarding.useRGBAssetSubTitle}
          onPress={() => {
            setVisible(false);
            navigation.navigate(NavigationRoutes.SELECTWALLET);
          }}
        />
      </ResponsePopupContainer>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    title: {
      color: theme.colors.headingColor,
      marginTop: Platform.OS === 'ios' ? hp(35) : hp(50),
      marginBottom: hp(20),
    },
    optionCardStyle: {
      paddingHorizontal: hp(20),
      borderRadius: 30,
      marginVertical: hp(5),
    },
    containerStyle: {
      height: windowHeight - hp(140),
      width: '100%',
      backgroundColor: theme.colors.modalBackColor,
      padding: hp(5),
      borderRadius: hp(30),
      marginHorizontal: 0,
      marginBottom: 5,
    },
    webViewStyle: {
      flex: 1,
      marginVertical: hp(10),
      backgroundColor: theme.colors.modalBackColor,
      borderRadius: hp(30),
    },
    titleStyle: {
      textAlign: 'center',
      marginVertical: hp(10),
    },
  });
export default WalletSetupOption;
