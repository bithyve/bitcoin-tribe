import React, { useContext, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from 'src/components/OptionCard';
import IconWallet from 'src/assets/images/icon_wallet1.svg';
import IconWalletLight from 'src/assets/images/icon_wallet1_light.svg';
import IconRecovery from 'src/assets/images/icon_recoveryphrase.svg';
import IconRecoveryLight from 'src/assets/images/icon_recoveryphrase_light.svg';
import { hp } from 'src/constants/responsive';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppText from 'src/components/AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { Keys } from 'src/storage';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import UseRGBAssetPopupContainer from './components/UseRGBAssetPopupContainer';
import config, { APP_STAGE } from 'src/utils/config';

function WalletSetupOption({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;

  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [visible, setVisible] = useState(false);

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
        onPress={() => {
          if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
            navigation.navigate(NavigationRoutes.SELECTWALLET);
          } else {
            navigation.navigate(NavigationRoutes.PROFILESETUP);
          }
        }}
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
  });
export default WalletSetupOption;
