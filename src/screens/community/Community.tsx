import * as React from 'react';
import { useTheme } from 'react-native-paper';

import ScreenContainer from 'src/components/ScreenContainer';
import { AppTheme } from 'src/theme';

function Community() {
  const theme: AppTheme = useTheme();
  return <ScreenContainer />;
}
export default Community;
