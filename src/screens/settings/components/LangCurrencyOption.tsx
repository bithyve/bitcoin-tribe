import React, { ReactNode } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import AppText from 'src/components/AppText';
import IconArrowDown from 'src/assets/images/icon_arrowd.svg';
import { hp } from 'src/constants/responsive';
import AppTouchable from 'src/components/AppTouchable';

type LangCurrencyOptionProps = {
  icon: ReactNode;
  title: string;
  subTitle: string;
  langCurrency: string;
  langCurrencyVariant: string;
  onPress?: () => void;
};

function LangCurrencyOption(props: LangCurrencyOptionProps) {
  const { icon, title, subTitle, langCurrency, langCurrencyVariant, onPress } =
    props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {icon}
        <View style={styles.contentWrapper}>
          <AppText variant="body1" style={styles.titleText}>
            {title}
          </AppText>
          <AppText variant="body2" style={styles.subTitleText}>
            {subTitle}
          </AppText>
        </View>
      </View>
      <AppTouchable style={styles.inputWrapper} onPress={onPress}>
        <AppText variant="body1" style={styles.langCurrencyStyle}>
          {langCurrency}
        </AppText>
        <AppText variant="heading3" style={styles.langCurrencyVariantStyle}>
          {langCurrencyVariant}
        </AppText>
        <View style={styles.iconArrowWrapper}>
          <IconArrowDown />
        </View>
      </AppTouchable>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginVertical: hp(15),
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    contentWrapper: {
      marginLeft: 10,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      backgroundColor: theme.colors.inputBackground,
      padding: 15,
      borderRadius: 10,
      marginTop: hp(15),
    },
    titleText: {
      color: theme.colors.accent3,
    },
    subTitleText: {
      color: theme.colors.bodyColor,
    },
    langCurrencyStyle: {
      color: theme.colors.accent2,
      width: '20%',
      alignItems: 'center',
      justifyContent: 'center',
      borderRightColor: theme.colors.borderColor,
      borderRightWidth: 2,
    },
    langCurrencyVariantStyle: {
      color: theme.colors.headingColor,
      width: '70%',
      marginLeft: 10,
    },
    iconArrowWrapper: {
      width: '10%',
    },
  });

export default LangCurrencyOption;
