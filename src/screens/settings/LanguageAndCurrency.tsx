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
import { StyleSheet, View } from 'react-native';
import { hp } from 'src/constants/responsive';
import { useMMKVString } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import availableLanguages from 'src/loc/availableLanguages';

function LanguageAndCurrency() {
  const { translations, initializeAppLanguage } =
    useContext(LocalizationContext);
  const { settings } = translations;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [language, setLanguage] = useMMKVString(Keys.APP_LANGUAGE);
  const [langDropdown, setLangDropdown] = React.useState(false);
  const selectedLanguage = availableLanguages.find(
    lang => lang.iso === language,
  );

  useEffect(() => {
    initializeAppLanguage();
  }, [language]);

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
          langCurrency={selectedLanguage && selectedLanguage.iso}
          langCurrencyVariant={
            selectedLanguage && selectedLanguage.displayTitle
          }
          onPress={() => setLangDropdown(!langDropdown)}
        />
      </View>
      <LangCurrencyOption
        title={settings.currency}
        subTitle={settings.currencySubTitle}
        icon={<IconCurrency />}
        langCurrency={'INR-₹'}
        langCurrencyVariant={'Indian Rupee'}
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
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    languageDropdownContainer: {
      position: 'absolute',
      top: '50%',
      borderRadius: 10,
      marginHorizontal: hp(15),
    },
  });
export default LanguageAndCurrency;
