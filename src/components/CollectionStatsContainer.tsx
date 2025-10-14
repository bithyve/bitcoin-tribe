import { hp } from 'src/constants/responsive';
import GradientView from './GradientView';
import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import { useContext } from 'react';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import Colors from 'src/theme/Colors';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';

const LIGHT_GRADIENT = [
  'rgba(242, 242, 242, 1)',
  'rgba(228, 228, 228, 1)',
  'rgba(236, 236, 236, 1)',
];
const DARK_GRADIENT = [
  'rgba(26, 26, 26, 1)',
  'rgba(11, 11, 11, 1)',
  'rgba(18, 18, 18, 1)',
];

export const CollectionStatsContainer = ({
  items,
  minted,
  totalMinted,
  supply,
}) => {
  const { home, assets } = useContext(LocalizationContext).translations;
  const theme: AppTheme = useTheme();

  return (
    <GradientView
      // @ts-ignore
      colors={theme.dark ? DARK_GRADIENT : LIGHT_GRADIENT}
      style={styles.container}>
      <View style={{ alignItems: 'center' }}>
        <AppText variant="captionBold">{items}</AppText>
        <AppText variant="muted" style={{ color: Colors.mediumGray }}>
          {assets.totalItems}
        </AppText>
      </View>
      <Divider />
      <View style={{ alignItems: 'center' }}>
        <AppText variant="captionBold">{`${minted}/${totalMinted}`}</AppText>
        <AppText variant="muted" style={{ color: Colors.mediumGray }}>
          {assets.minted}
        </AppText>
      </View>
      <Divider />
      <View style={{ alignItems: 'center' }}>
        <AppText variant="captionBold">{supply}</AppText>
        <AppText variant="muted" style={{ color: Colors.mediumGray }}>
          {home.totalSupplyAmount}
        </AppText>
      </View>
    </GradientView>
  );
};

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(35, 35, 35, 1)',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: hp(15),
    borderRadius: 10,
    alignItems: 'center',
  },
});
