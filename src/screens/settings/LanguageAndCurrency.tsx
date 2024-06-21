import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import LangCurrencyOption from './components/LangCurrencyOption';
import IconLanguage from 'src/assets/images/icon_globe.svg';
import IconCurrency from 'src/assets/images/icon_coins.svg';

function LanguageAndCurrency() {
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const theme: AppTheme = useTheme();
  return (
    <ScreenContainer>
      <AppHeader
        title={settings.langAndCurrency}
        subTitle={settings.langAndCurrencySubTitle}
      />
      <LangCurrencyOption
        title={settings.language}
        subTitle={settings.languageSubTitle}
        icon={<IconLanguage />}
        langCurrency={'English'}
        langCurrencyVariant={'English UK'}
      />
      <LangCurrencyOption
        title={settings.currency}
        subTitle={settings.currencySubTitle}
        icon={<IconCurrency />}
        langCurrency={'INR-₹'}
        langCurrencyVariant={'Indian Rupee'}
      />
    </ScreenContainer>
  );
}
export default LanguageAndCurrency;
