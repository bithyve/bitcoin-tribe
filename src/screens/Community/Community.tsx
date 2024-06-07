import * as React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

// import ScreenContainer from '../../components/ScreenContainer';
import CommonStyles from '../../common/styles/CommonStyles';
import TileSurface from '../../components/TileSurface';
import AddNewTileSurface from '../../components/AddNewTileSurface';

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
      <Text
        style={[CommonStyles.heading1, { color: theme.colors.headingColor }]}>
        Popup Heading 1
      </Text>
      <Text
        style={[CommonStyles.heading2, { color: theme.colors.headingColor }]}>
        Popup Heading 2
      </Text>
      <Text
        style={[CommonStyles.pageTitle, { color: theme.colors.headingColor }]}>
        Page Title 1
      </Text>
      <Text style={[CommonStyles.body5, { color: theme.colors.bodyTextColor }]}>
        Body 5
      </Text>
      <Text style={[CommonStyles.body4, { color: theme.colors.bodyTextColor }]}>
        Body 4
      </Text>
      <Text style={[CommonStyles.body2, { color: theme.colors.bodyTextColor }]}>
        Body 2 - The blinded UTXO in this invoice will expire in 24 hours after
        its creation.
      </Text>
      <Text style={[CommonStyles.body1, { color: theme.colors.bodyTextColor }]}>
        Body 1 : lk2j3429-85213-5134 50t-934285… 6 23…-
      </Text>
      <Text
        style={[
          CommonStyles.textFieldLabel,
          { color: theme.colors.headingColor },
        ]}>
        Text Feild
      </Text>
      <Text
        style={[
          CommonStyles.placeholder,
          { color: theme.colors.placeholderColor },
        ]}>
        Placeholder
      </Text>
      <View
        style={{
          backgroundColor: theme.colors.primaryCTA,
          padding: 5,
          borderRadius: 10,
        }}>
        <Text
          style={[
            CommonStyles.toastMessage,
            {
              color: theme.colors.textColor,
            },
          ]}>
          Toast - Address Copied Successfully!
        </Text>
      </View>
      <Text style={[CommonStyles.subTitle, { color: theme.colors.recieveCTA }]}>
        Subtitle 1
      </Text>
      <Text style={[CommonStyles.body6, { color: theme.colors.bodyTextColor }]}>
        Body 6
      </Text>
      <Text style={[CommonStyles.body7, { color: theme.colors.buyCTA }]}>
        Body 7
      </Text>
      <Text
        style={[
          CommonStyles.secondaryCTATitle,
          { color: theme.colors.primaryCTA },
        ]}>
        Secondary CTA - Skip
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <TileSurface />
        <View style={{ margin: 5 }} />
        <AddNewTileSurface />
      </View>
    </View>
  );
}
export default Community;
