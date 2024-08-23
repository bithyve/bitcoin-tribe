import React, { useContext } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';

function Community() {
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <ScreenContainer>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="body1" style={{ color: theme.colors.headingColor }}>
          {common.commingSoon}
        </AppText>
        <AppText
          variant="body2"
          style={{
            color: theme.colors.secondaryHeadingColor,
            textAlign: 'center',
          }}>
          {common.commingSoonSubTitle}
        </AppText>
      </View>
    </ScreenContainer>
  );
}
export default Community;
