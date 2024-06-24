import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import IconRamp from 'src/assets/images/icon_ramp.svg';
import SelectOption from 'src/components/SelectOption';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

function BuyModal() {
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <SelectOption
        title={wallet.buyWithRamp}
        subTitle={wallet.buyWithRampSubTitle}
        icon={<IconRamp />}
        backColor={theme.colors.inputBackground}
        style={styles.optionStyle}
        onPress={() => console.log('press')}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingBottom: hp(25),
    },
    optionStyle: {
      marginVertical: 10,
      paddingHorizontal: 20,
    },
  });
export default BuyModal;
