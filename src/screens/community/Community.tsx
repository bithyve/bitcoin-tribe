import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AssetCard from 'src/components/AssetCard';
import AddNewTile from 'src/components/AddNewTile';
import AppText from 'src/components/AppText';
import AssetChip from 'src/components/AssetChip';
import CommonStyles from 'src/common/styles/CommonStyles';

function Community() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#434343',
      }}>
      <AppText variant="heading1" style={{ color: theme.colors.headingColor }}>
        Popup Heading 1
      </AppText>
      <AppText variant="heading2" style={{ color: theme.colors.headingColor }}>
        Popup Heading 2
      </AppText>
      <AppText variant="pageTitle" style={{ color: theme.colors.headingColor }}>
        Page Title 1
      </AppText>
      <AppText variant="body5" style={{ color: theme.colors.bodyColor }}>
        Body 5
      </AppText>
      <AppText variant="body4" style={{ color: theme.colors.bodyColor }}>
        Body 4
      </AppText>
      <AppText variant="body2" style={{ color: theme.colors.bodyColor }}>
        Body 2 - The blinded UTXO in this invoice will expire in 24 hours after
        its creation.
      </AppText>
      <AppText variant="body1" style={{ color: theme.colors.bodyColor }}>
        Body 1 : lk2j3429-85213-5134 50t-934285… 6 23…-
      </AppText>
      <AppText
        variant="textFieldLabel"
        style={{ color: theme.colors.headingColor }}>
        Text Feild
      </AppText>
      <AppText
        style={[CommonStyles.placeholder, { color: theme.colors.placeholder }]}>
        Placeholder
      </AppText>
      <AppText variant="subTitle" style={{ color: theme.colors.accent2 }}>
        Subtitle 1
      </AppText>
      <AppText variant="body6" style={{ color: theme.colors.bodyColor }}>
        Body 6
      </AppText>
      <AppText variant="body7" style={{ color: theme.colors.accent1 }}>
        Body 7
      </AppText>
      <AssetChip tagText="COLLECTIBLES" />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <AssetCard
          asset={'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4'}
          title="The Demogorgan"
          details="Humanoid creature… with head shaped like a flower"
        />
        <View style={{ margin: 5 }} />
        <AddNewTile title="Add New" />
      </View>
    </View>
  );
}
export default Community;
