import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

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
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';

function WalletSetupOption({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;

  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  return (
    <ScreenContainer>
      <AppText variant="pageTitle1" style={styles.title}>
        {onBoarding.walletSetupTitle}
      </AppText>
      <OptionCard
        icon={!isThemeDark ? <IconWallet /> : <IconWalletLight />}
        title={onBoarding.createNew}
        subTitle={onBoarding.createNewSubTitle}
        showRightArrow={true}
        onPress={() => navigation.navigate(NavigationRoutes.SELECTWALLET)}
      />
      <OptionCard
        icon={!isThemeDark ? <IconRecovery /> : <IconRecoveryLight />}
        title={onBoarding.recoveryPhrase}
        subTitle={onBoarding.recoveryPhraseSubTitle}
        showRightArrow={true}
        onPress={() => navigation.navigate(NavigationRoutes.ENTERSEEDSCREEN)}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    advanceOptionStyle: {
      flex: 1,
      position: 'absolute',
      bottom: 10,
      margin: hp(20),
    },
    title: {
      color: theme.colors.headingColor,
      marginTop: hp(25),
      marginBottom: hp(20),
    },
  });
export default WalletSetupOption;
