import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { View } from 'react-native';

import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import AppHeader from 'src/components/AppHeader';

function NodeSettings() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  return (
    <View>
      <AppHeader
        title={settings.langAndCurrency}
        subTitle={settings.langAndCurrencySubTitle}
      />
    </View>
  );
}
export default NodeSettings;
