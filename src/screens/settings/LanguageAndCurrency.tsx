import React, { useContext, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { useNavigation } from '@react-navigation/native';
import { Platform, StyleSheet, View } from 'react-native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import LangCurrencyOption from './components/LangCurrencyOption';
import IconLangCurrency from 'src/assets/images/langIcon.svg';
import IconLangCurrencyLight from 'src/assets/images/langIcon_light.svg';
import IconCurrency from 'src/assets/images/icon_coins.svg';
import IconCurrencyLight from 'src/assets/images/icon_coins_light.svg';
import LangDropDownListView from './components/LangDropDownListView';
import { hp, windowHeight } from 'src/constants/responsive';
import { Keys } from 'src/storage';
import availableLanguages from 'src/loc/availableLanguages';
import CurrencyDropDownListView from './components/CurrencyDropDownListView';
import availableCurrency from 'src/loc/availableCurrency';
import SelectOption from 'src/components/SelectOption';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import FooterNote from 'src/components/FooterNote';


function LanguageAndCurrency() {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { settings, common } = translations;
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [language, setLanguage] = useMMKVString(Keys.APP_LANGUAGE);
  const [currency, setCurrency] = useMMKVString(Keys.APP_CURRENCY);
  const [langDropdown, setLangDropdown] = useState(false);
  const [currencyDropDown, setCurrencyDropDown] = useState(false);
  const [currentCurrencyMode, setCurrencyMode] = useMMKVString(
    Keys.CURRENCY_MODE,
  );

  const selectedLanguage = availableLanguages.find(
    lang => lang.iso === language,
  );

  const initialCurrencyMode = currentCurrencyMode || CurrencyKind.SATS;

  const initialCurrency = currency || 'USD';
  const selectedCurrency = availableCurrency.find(
    cur => cur.code === initialCurrency,
  );

  const toggleDisplayMode = () => {
    if (!initialCurrencyMode || initialCurrencyMode === CurrencyKind.SATS) {
      setCurrencyMode(CurrencyKind.BITCOIN);
    } else {
      setCurrencyMode(CurrencyKind.SATS);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={currencyDropDown || langDropdown ? '' : settings.langAndCurrency}
        subTitle={settings.langAndCurrencySubTitle}
        onBackNavigation={()=>{
          if(currencyDropDown || langDropdown){
            setLangDropdown(false);
            setCurrencyDropDown(false);
          }else{
            navigation.goBack()
          }
        }}
      />
      <SelectOption
        title={settings.satsModeTitle}
        subTitle={settings.satsModeSubTitle}
        onPress={() => toggleDisplayMode()}
        enableSwitch={true}
        onValueChange={() => toggleDisplayMode()}
        toggleValue={initialCurrencyMode === CurrencyKind.SATS}
      />
      <View style={{ position: 'relative' }}>
        <LangCurrencyOption
          title={settings.language}
          subTitle={settings.languageSubTitle}
          icon={isThemeDark ? <IconLangCurrency /> : <IconLangCurrencyLight />}
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
        icon={isThemeDark ? <IconCurrency /> : <IconCurrencyLight />}
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
          onDissmiss={() => setLangDropdown(false)}
          selectedLanguage={selectedLanguage && selectedLanguage.iso}
          langCurrency={selectedLanguage && selectedLanguage.language}
          langCurrencyVariant={
            selectedLanguage &&
            selectedLanguage.displayTitle +
              ' ' +
              selectedLanguage.iso.toUpperCase()
          }
        />
      )}
      {currencyDropDown && (
        <CurrencyDropDownListView
          currencies={availableCurrency}
          callback={item => {
            setCurrencyDropDown(false);
            setCurrency(item.code);
            setCurrencyMode(CurrencyKind.FIAT);
          }}
          onDissmiss={() => setCurrencyDropDown(false)}
          selectedCurrency={selectedCurrency && selectedCurrency.code}
          style={styles.currencyDropdownContainer}
          langCurrency={selectedCurrency && selectedCurrency.currency}
          langCurrencyVariant={
            selectedCurrency && selectedCurrency.displayTitle
          }
        />
      )}
      <FooterNote
        title={common.note}
        subTitle={settings.langNoteSubTitle}
        customStyle={styles.noteWrapper}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    languageDropdownContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? (windowHeight > 670 ? '18%' : '15%') : '10%',
      borderRadius: 20,
      marginHorizontal: hp(15),
    },
    currencyDropdownContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? (windowHeight > 670 ? '18%' : '15%') : '10%',
      borderRadius: 20,
      marginHorizontal: hp(15),
    },
    noteWrapper: {
      position: 'absolute',
      bottom: Platform.OS === 'android' ? 50 : 20,
      alignSelf: 'center',
    },
  });
export default LanguageAndCurrency;
