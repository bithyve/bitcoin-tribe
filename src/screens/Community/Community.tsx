import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

import CommonStyles from '../../common/styles/CommonStyles';
import AssetCard from '../../components/AssetCard';
import AddNewTile from '../../components/AddNewTile';
import AppText from '../../components/AppText';

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
      <AppText variant="body5" style={{ color: theme.colors.bodyTextColor }}>
        Body 5
      </AppText>
      <AppText variant="body4" style={{ color: theme.colors.bodyTextColor }}>
        Body 4
      </AppText>
      <AppText variant="body2" style={{ color: theme.colors.bodyTextColor }}>
        Body 2 - The blinded UTXO in this invoice will expire in 24 hours after
        its creation.
      </AppText>
      <AppText variant="body1" style={{ color: theme.colors.bodyTextColor }}>
        Body 1 : lk2j3429-85213-5134 50t-934285… 6 23…-
      </AppText>
      <AppText
        variant="textFieldLabel"
        style={{ color: theme.colors.headingColor }}>
        Text Feild
      </AppText>
      <AppText
        style={[
          CommonStyles.placeholder,
          { color: theme.colors.placeholderColor },
        ]}>
        Placeholder
      </AppText>
      <AppText variant="subTitle" style={{ color: theme.colors.recieveCTA }}>
        Subtitle 1
      </AppText>
      <AppText variant="body6" style={{ color: theme.colors.bodyTextColor }}>
        Body 6
      </AppText>
      <AppText variant="body7" style={{ color: theme.colors.buyCTA }}>
        Body 7
      </AppText>
      <AppText
        variant="secondaryCTATitle"
        style={{ color: theme.colors.primaryCTA }}>
        Secondary CTA - Skip
      </AppText>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <AssetCard />
        <View style={{ margin: 5 }} />
        <AddNewTile />
      </View>
    </View>
  );
}
export default Community;
