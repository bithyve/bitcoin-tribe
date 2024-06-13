import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AssetCard from 'src/components/AssetCard';
import AddNewTile from 'src/components/AddNewTile';
import AppText from 'src/components/AppText';
import AssetChip from 'src/components/AssetChip';
import CommonStyles from 'src/common/styles/CommonStyles';
import ScreenContainer from '../../components/ScreenContainer';

function Community() {
  const theme = useTheme();
  return <ScreenContainer></ScreenContainer>;
}
export default Community;
