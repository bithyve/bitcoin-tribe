import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { AppTheme } from 'src/theme';

type currencySwitchProps = {
  onPress: () => void;
  selectedCurrency: {
    code: string;
    currency: string;
    displayTitle: string;
    symbol: string;
  };
  currentCurrencyMode: string;
};
const CurrencySwitch = (props: currencySwitchProps) => {
  const { onPress, selectedCurrency, currentCurrencyMode } = props;
  // console.log('selectedCurrency', selectedCurrency);
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [selected, setSelected] = useState(currentCurrencyMode === CurrencyKind.SATS || currentCurrencyMode === CurrencyKind.BITCOIN);

  // useEffect(() => {
  //   console.log('selectedCurrency', selectedCurrency)
  //   setSelected(selectedCurrency);
  // }, [selectedCurrency]);

  const handleToggle = () => {
    setSelected(!selected);
    onPress();
  };

  return (
    <Surface style={styles.container}>
      <TouchableRipple
        onPress={() => handleToggle()}
        style={[styles.option, !selected && styles.selectedOption]}>
        <Text style={[styles.text, !selected && styles.selectedText]}>
          {selectedCurrency.symbol}
        </Text>
      </TouchableRipple>
      <TouchableRipple
        onPress={() => handleToggle()}
        style={[styles.option, selected && styles.selectedOption]}>
        <Text style={[styles.text, selected && styles.selectedText]}>₿</Text>
      </TouchableRipple>
      <View
        style={[
          styles.indicator,
          { left: !selected ? 5 : 40, right: selected ? 5 : 40 },
        ]}
      />
    </Surface>
  );
};

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.accent1,
      borderRadius: 25,
      width: 75,
      height: 40,
      position: 'relative',
    },
    option: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: 18,
      color: 'black',
      fontWeight: 'bold',
    },
    selectedOption: {
      zIndex: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedText: {
      color: 'black',
    },
    indicator: {
      position: 'absolute',
      width: 30,
      height: 30,
      backgroundColor: 'white',
      borderRadius: 15,
      elevation: 2,
    },
  });

export default CurrencySwitch;
