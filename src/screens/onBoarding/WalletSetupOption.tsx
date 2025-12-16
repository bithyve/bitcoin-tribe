import React, { useContext, useState } from 'react';
import { Alert, Platform, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from 'src/components/OptionCard';
import IconWallet from 'src/assets/images/icon_wallet1.svg';
import IconWalletLight from 'src/assets/images/icon_wallet1_light.svg';
import IconRecovery from 'src/assets/images/icon_recoveryphrase.svg';
import IconRecoveryLight from 'src/assets/images/icon_recoveryphrase_light.svg';
import { hp, windowHeight } from 'src/constants/responsive';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppText from 'src/components/AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import UseRGBAssetPopupContainer from './components/UseRGBAssetPopupContainer';
import config, { APP_STAGE } from 'src/utils/config';
import { NetworkType } from 'src/services/wallets/enums';
import * as bitcoinJS from 'bitcoinjs-lib';

function WalletSetupOption({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;

  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [visible, setVisible] = useState(false);

  const selectNetworkAndNavigate = (route: NavigationRoutes) => {
    if (config.ENVIRONMENT === APP_STAGE.PRODUCTION) {
      config.NETWORK_TYPE = NetworkType.MAINNET;
      config.NETWORK = bitcoinJS.networks.bitcoin;
      navigation.navigate(route);
      return;
    }
    Alert.alert(
      'Select Bitcoin Network',
      'Select the network you want to use',
      [
        { text: 'Cancel', style: 'cancel' },
        ...[
          { label: 'Testnet4', type: NetworkType.TESTNET4, net: bitcoinJS.networks.testnet },
          { label: 'Regtest', type: NetworkType.REGTEST, net: bitcoinJS.networks.regtest },
        ].map(({ label, type, net }) => ({
          text: label,
          onPress: () => {
            config.NETWORK_TYPE = type;
            config.NETWORK = net;
            navigation.navigate(route);
          },
        })),
      ]
    );
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
        onPress={() => selectNetworkAndNavigate(NavigationRoutes.PROFILESETUP)}
        style={styles.optionCardStyle}
      />
      <OptionCard
        icon={isThemeDark ? <IconRecovery /> : <IconRecoveryLight />}
        title={onBoarding.recoveryPhrase}
        subTitle={onBoarding.recoveryPhraseSubTitle}
        showRightArrow={true}
        onPress={() =>
          selectNetworkAndNavigate(NavigationRoutes.ENTERSEEDSCREEN)
        }
        style={styles.optionCardStyle}
      />

      <ResponsePopupContainer
        visible={visible}
        enableClose={true}
        backColor={theme.colors.modalBackColor}
        borderColor={theme.colors.modalBackColor}
      >
        <UseRGBAssetPopupContainer
          title={onBoarding.useRGBAssetTitle}
          subTitle={onBoarding.useRGBAssetSubTitle}
          onPress={() => {
            setVisible(false);
            selectNetworkAndNavigate(NavigationRoutes.SELECTWALLET);
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
