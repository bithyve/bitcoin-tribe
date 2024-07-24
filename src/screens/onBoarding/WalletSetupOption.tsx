import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from 'src/components/OptionCard';
import IconWallet from 'src/assets/images/icon_wallet1.svg';
import IconRecovery from 'src/assets/images/icon_recoveryphrase.svg';
import { hp } from 'src/constants/responsive';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppText from 'src/components/AppText';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

function WalletSetupOption({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onBoarding } = translations;

  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  return (
    <ScreenContainer>
      <AppText variant="pageTitle1" style={styles.title}>
        {onBoarding.walletSetupTitle}
      </AppText>
      <OptionCard
        icon={<IconWallet />}
        title={onBoarding.createNew}
        subTitle={onBoarding.createNewSubTitle}
        onPress={() => navigation.navigate(NavigationRoutes.PROFILESETUP)}
      />
      <OptionCard
        icon={<IconRecovery />}
        title={onBoarding.recoveryPhrase}
        subTitle={onBoarding.recoveryPhraseSubTitle}
        onPress={() => console.log('Recovery Phrase')}
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
      marginTop: hp(20),
      marginBottom: hp(30),
    },
  });
export default WalletSetupOption;
