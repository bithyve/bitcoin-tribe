import React, { useContext, useEffect } from 'react';
import { useTheme } from 'react-native-paper';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import LangCurrencyOption from './components/LangCurrencyOption';
import IconLanguage from 'src/assets/images/icon_globe.svg';
import IconCurrency from 'src/assets/images/icon_coins.svg';
import LangDropDownListView from './components/LangDropDownListView';
import { Platform, StyleSheet, View } from 'react-native';
import { hp } from 'src/constants/responsive';
import { useMMKVString } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import availableLanguages from 'src/loc/availableLanguages';
import { ApiHandler } from 'src/services/handler/apiHandler';
import CurrencyDropDownListView from './components/CurrencyDropDownListView';
import availableCurrency from 'src/loc/availableCurrency';

function LanguageAndCurrency() {
  const { translations, initializeAppLanguage } =
    useContext(LocalizationContext);
  const { settings } = translations;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [language, setLanguage] = useMMKVString(Keys.APP_LANGUAGE);
  const [currency, setCurrency] = useMMKVString(Keys.APP_CURRENCY) || 'USD';
  const [langDropdown, setLangDropdown] = React.useState(false);
  const [currencyDropDown, setCurrencyDropDown] = React.useState(false);

  const selectedLanguage = availableLanguages.find(
    lang => lang.iso === language,
  );

  const selectedCurrency = availableCurrency.find(cur => cur.code === currency);

  useEffect(() => {
    initializeAppLanguage();
  }, [language]);

  useEffect(() => {
    ApiHandler.getFeeAndExchangeRates();
  }, []);

  return (
    <ScreenContainer>
      <AppHeader
        title={settings.langAndCurrency}
        subTitle={settings.langAndCurrencySubTitle}
      />
      <View style={{ position: 'relative' }}>
        <LangCurrencyOption
          title={settings.language}
          subTitle={settings.languageSubTitle}
          icon={<IconLanguage />}
          langCurrency={selectedLanguage && selectedLanguage.language}
          langCurrencyVariant={
            selectedLanguage &&
            selectedLanguage.displayTitle +
              ' ' +
              selectedLanguage.iso.toUpperCase()
          }
          onPress={() => setLangDropdown(!langDropdown)}
        />
      </View>
      <LangCurrencyOption
        title={settings.currency}
        subTitle={settings.currencySubTitle}
        icon={<IconCurrency />}
        langCurrency={selectedCurrency && selectedCurrency.currency}
        langCurrencyVariant={selectedCurrency && selectedCurrency.displayTitle}
        onPress={() => setCurrencyDropDown(!currencyDropDown)}
      />
      {langDropdown && (
        <LangDropDownListView
          style={styles.languageDropdownContainer}
          languages={availableLanguages}
          callback={item => {
            setLangDropdown(false);
            setLanguage(item.iso);
          }}
          selectedLanguage={selectedLanguage && selectedLanguage.iso}
        />
      )}
      {currencyDropDown && (
        <CurrencyDropDownListView
          currencies={availableCurrency}
          callback={item => {
            setCurrencyDropDown(false);
            setCurrency(item.code);
          }}
          selectedCurrency={selectedCurrency && selectedCurrency.code}
          style={styles.currencyDropdownContainer}
        />
      )}
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    languageDropdownContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? '50%' : '42%',
      borderRadius: 20,
      marginHorizontal: hp(15),
    },
    currencyDropdownContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? '72%' : '62%',
      borderRadius: 20,
      marginHorizontal: hp(15),
    },
  });
export default LanguageAndCurrency;
