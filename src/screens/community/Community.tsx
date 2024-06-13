import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AssetCard from 'src/components/AssetCard';
import AddNewTile from 'src/components/AddNewTile';
import AppText from 'src/components/AppText';
import AssetChip from 'src/components/AssetChip';
import CommonStyles from 'src/common/styles/CommonStyles';
import ScreenContainer from '../../components/ScreenContainer';
import { AppTheme } from 'src/theme';

function Community() {
  const theme: AppTheme = useTheme();
  return <ScreenContainer />;
}
export default Community;
