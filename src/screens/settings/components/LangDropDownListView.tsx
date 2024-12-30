import * as React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { RadioButton, useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';

import { AppTheme } from 'src/theme';
import GradientView from '../../../components/GradientView';
import { hp } from 'src/constants/responsive';
import AppText from '../../../components/AppText';
import AppTouchable from '../../../components/AppTouchable';
import { Keys } from 'src/storage';
import IconArrowDown from 'src/assets/images/icon_arrowUp.svg';
import IconArrowDownLight from 'src/assets/images/icon_arrowUp_light.svg';

type DropdownProps = {
  style;
  languages: [number, string, string];
  selectedLanguage: string;
  callback: (item) => void;
  langCurrency: string;
  langCurrencyVariant: string;
  onDissmiss?: () => void;
  flag?
};

function LangDropDownListView(props: DropdownProps) {
  const {
    style,
    languages,
    callback,
    selectedLanguage,
    langCurrency,
    langCurrencyVariant,
    onDissmiss,
    flag
  } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  return (
    <View style={[style, styles.container]}>
      <AppTouchable onPress={onDissmiss}>
        <GradientView
          style={styles.inputWrapper}
          colors={[
            theme.colors.cardGradient1,
            theme.colors.cardGradient2,
            theme.colors.cardGradient3,
          ]}>
          <View style={styles.langCurrencyWrapper}>
            <AppText variant="body1" style={styles.langCurrencyStyle}>
              {langCurrency}
            </AppText>
          </View>
          <AppText variant="heading3" style={styles.langCurrencyVariantStyle}>
          {flag} {langCurrencyVariant}
          </AppText>
          <View style={styles.iconArrowWrapper}>
            {isThemeDark ? <IconArrowDown /> : <IconArrowDownLight />}
          </View>
        </GradientView>
      </AppTouchable>

      <FlatList
        style={styles.container2}
        data={languages}
        renderItem={({ item }) => (
          <AppTouchable onPress={() => callback(item)}>
            <View style={styles.wrapper}>
              <View style={styles.radioBtnWrapper}>
                <AppText variant="body2" style={styles.languageText}>
                  {item.flag}&nbsp; {item.language + ' ' + item.country_code}
                </AppText>
                <RadioButton.Android
                  color={theme.colors.accent1}
                  uncheckedColor={theme.colors.headingColor}
                  value={item.iso}
                  status={
                    selectedLanguage == item.iso ? 'checked' : 'unchecked'
                  }
                  onPress={() => callback(item)}
                />
              </View>
            </View>
          </AppTouchable>
        )}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      zIndex: 999,
      height: '93%',
      backgroundColor: theme.colors.primaryBackground,
    },
    container2: {
      borderRadius: hp(20),
      marginTop: hp(20),
      backgroundColor: theme.colors.cardBackground,
      paddingTop: hp(10),
    },
    wrapper: {
      paddingHorizontal: hp(15),
      paddingVertical: hp(5),
    },
    radioBtnWrapper: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: hp(15),
      paddingVertical: hp(10),
    },
    languageText: {
      color: theme.colors.headingColor,
      width: '90%',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      padding: 15,
      borderRadius: 10,
      marginTop: hp(15),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
    langCurrencyWrapper: {
      width: '28%',
      justifyContent: 'center',
      borderRightWidth: 2,
      borderRightColor: theme.colors.secondaryHeadingColor,
    },
    langCurrencyStyle: {
      color: theme.colors.accent2,
    },
    langCurrencyVariantStyle: {
      color: theme.colors.headingColor,
      width: '62%',
      marginLeft: 10,
    },
    iconArrowWrapper: {
      width: '10%',
    },
  });
export default LangDropDownListView;
