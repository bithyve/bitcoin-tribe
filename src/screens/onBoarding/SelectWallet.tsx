import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import AppHeader from 'src/components/AppHeader';
import SelectWalletCollapse from './components/SelectWalletCollapse';
import SelectWalletTypeOption from './components/SelectWalletTypeOption';
import SupportIcon from 'src/assets/images/supportIcon.svg';

function SelectWallet() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common, onBoarding } = translations;
  const styles = getStyles(theme);
  return (
    <ScreenContainer>
      <AppHeader title={onBoarding.selectWalletType} />
      <SelectWalletCollapse />
      <SelectWalletTypeOption
        title={onBoarding.supported}
        icon={<SupportIcon />}
        disabled={true}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    imageWrapper: {},
    textStyle: {
      color: theme.colors.headingColor,
      textAlign: 'center',
      fontWeight: '600',
      fontSize: 36,
    },
    subTextStyle: {
      color: theme.colors.secondaryHeadingColor,
      textAlign: 'center',
    },
  });
export default SelectWallet;
