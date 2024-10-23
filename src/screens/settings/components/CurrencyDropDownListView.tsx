import * as React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { RadioButton, useTheme } from 'react-native-paper';

import { AppTheme } from 'src/theme';
import GradientView from '../../../components/GradientView';
import { hp } from 'src/constants/responsive';
import AppText from '../../../components/AppText';
import AppTouchable from '../../../components/AppTouchable';

type DropdownProps = {
  style;
  currencies: [number, string, string];
  selectedCurrency: string;
  callback: (item) => void;
};

function CurrencyDropDownListView(props: DropdownProps) {
  const { style, currencies, callback, selectedCurrency } = props;
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <FlatList
      style={[style, styles.container]}
      data={currencies}
      renderItem={({ item }) => (
        <AppTouchable onPress={() => callback(item)}>
          <GradientView
            style={styles.wrapper}
            colors={[
              theme.colors.cardGradient1,
              theme.colors.cardGradient2,
              theme.colors.cardGradient3,
            ]}>
            <View style={styles.radioBtnWrapper}>
              <AppText variant="body2" style={styles.languageText}>
                {item.currency}
              </AppText>
              <RadioButton.Android
                color={theme.colors.accent1}
                uncheckedColor={theme.colors.headingColor}
                value={item.code}
                status={selectedCurrency == item.code ? 'checked' : 'unchecked'}
                onPress={() => callback(item)}
              />
            </View>
          </GradientView>
        </AppTouchable>
      )}
    />
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      height: '45%',
      backgroundColor: theme.colors.cardBackground,
      zIndex: 999,
    },
    wrapper: {
      padding: hp(15),
    },
    radioBtnWrapper: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: 10,
      padding: hp(15),
    },
    languageText: {
      color: theme.colors.headingColor,
      width: '90%',
    },
  });
export default CurrencyDropDownListView;
