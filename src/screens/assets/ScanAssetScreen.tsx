import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import OptionCard from 'src/components/OptionCard';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import QRScanner from 'src/components/QRScanner';
import { AppTheme } from 'src/theme';
import { useTheme } from 'react-native-paper';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

function ScanAssetScreen({ route, navigation }) {
  const { assetId } = route;
  const theme: AppTheme = useTheme();
  const { translations } = useContext(LocalizationContext);
  const { sendScreen } = translations;
  const styles = getStyles(theme);

  return (
    <ScreenContainer>
      <AppHeader
        title={sendScreen.sendAssetTitle}
        subTitle={sendScreen.sendAssetSubtitle}
        enableBack={true}
      />
      <View style={styles.scannerWrapper}>
        <QRScanner />
      </View>
      <OptionCard
        title={sendScreen.optionCardTitle}
        subTitle={sendScreen.optionCardSubTitle}
        onPress={() => {
          navigation.navigate(NavigationRoutes.SENDASSET, {
            assetId: assetId,
          });
        }}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scannerWrapper: {
      flex: 1,
    },
  });
export default ScanAssetScreen;
