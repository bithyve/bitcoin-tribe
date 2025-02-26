import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import SecondaryCTA from 'src/components/SecondaryCTA';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import openLink from 'src/utils/OpenLink';

type hideAssetViewProps = {
  title: string;
  onPress: () => void;
  isVerified: boolean;
  assetId: string;
};

function HideAssetView(props: hideAssetViewProps) {
  const { title, onPress, isVerified, assetId } = props;
  const { translations } = React.useContext(LocalizationContext);
  const { assets } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={[styles.container, isVerified && styles.container2]}>
      <AppTouchable onPress={onPress}>
        <AppText variant="body2" style={[styles.titleStyle]}>
          {title}
        </AppText>
      </AppTouchable>
      {isVerified && (
        <SecondaryCTA
          title={assets.viewInRegistry}
          onPress={() =>
            openLink(`https://bitcointribe.app/registry?assetId=${assetId}`)
          }
          width={wp(200)}
          height={hp(14)}
        />
      )}
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignSelf: 'center',
      marginTop: hp(20),
      marginBottom: hp(20),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      width: '100%',
    },
    container2: {
      marginLeft: 30,
    },
    titleStyle: {
      color: theme.colors.headingColor,
      textDecorationLine: 'underline',
    },
  });
export default HideAssetView;
