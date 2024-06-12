import * as React from 'react';
import { StyleSheet } from 'react-native';

import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from './components/OptionCard';
import IconWallet from 'src/assets/images/icon_wallet1.svg';
import { hp } from 'src/constants/responsive';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AppText from 'src/components/AppText';
import { useTheme } from 'react-native-paper';

function WalletSetupOption({ navigation }) {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <ScreenContainer>
      <AppText variant="pageTitle" style={styles.title}>
        Welcome,
      </AppText>
      <OptionCard
        icon={<IconWallet />}
        title="Create New"
        subTitle="Lorem ipsum dolor sit amet"
        onPress={() => navigation.navigate(NavigationRoutes.PROFILESETUP)}
      />
      <OptionCard
        icon={<IconWallet />}
        title="Recovery Phrase"
        subTitle="Lorem ipsum dolor si"
        onPress={() => console.log('Recovery Phrase')}
      />
      <OptionCard
        title="Advanced Options"
        subTitle="Lorem ipsum dolor sit amet, consec"
        style={styles.advanceOptionStyle}
        onPress={() => console.log('Advanced Options')}
      />
    </ScreenContainer>
  );
}
const getStyles = theme =>
  StyleSheet.create({
    advanceOptionStyle: {
      flex: 1,
      position: 'absolute',
      bottom: 10,
      margin: hp(20),
    },
    title: {
      color: theme.colors.headingColor,
    },
  });
export default WalletSetupOption;
