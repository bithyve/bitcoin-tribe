import React, { ReactNode } from 'react';
import { useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { AppTheme } from 'src/theme';
import AppText from 'src/components/AppText';
import IconArrowDown from 'src/assets/images/icon_arrowd.svg';
import { hp } from 'src/constants/responsive';
import AppTouchable from 'src/components/AppTouchable';
import GradientView from 'src/components/GradientView';

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
          <AppText variant="heading3" style={styles.titleText}>
            {title}
          </AppText>
          <AppText variant="body1" style={styles.subTitleText}>
            {subTitle}
          </AppText>
        </View>
      </View>
      <AppTouchable onPress={onPress}>
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
            {langCurrencyVariant}
          </AppText>
          <View style={styles.iconArrowWrapper}>
            <IconArrowDown />
          </View>
        </GradientView>
      </AppTouchable>
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginVertical: hp(20),
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
      padding: 15,
      borderRadius: 10,
      marginTop: hp(15),
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
    },
    titleText: {
      color: theme.colors.headingColor,
    },
    subTitleText: {
      color: theme.colors.secondaryHeadingColor,
    },
    langCurrencyWrapper: {
      width: '28%',
      // alignItems: 'center',
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

export default LangCurrencyOption;
