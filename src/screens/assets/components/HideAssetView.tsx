import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from 'src/components/AppText';
import AppTouchable from 'src/components/AppTouchable';
import SecondaryCTA from 'src/components/SecondaryCTA';
import { hp, wp } from 'src/constants/responsive';
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
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <AppTouchable onPress={onPress}>
        <AppText variant="body2" style={[styles.titleStyle]}>
          {title}
        </AppText>
      </AppTouchable>
      {isVerified && (
        <SecondaryCTA
          title="View In Registry"
          onPress={() => openLink(`https://bitcointribe.app/registry?assetId=${assetId}`)}
          width={wp(170)}
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
    titleStyle: {
      color: theme.colors.headingColor,
      textDecorationLine: 'underline',
    },
  });
export default HideAssetView;
