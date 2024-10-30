import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppHeader from 'src/components/AppHeader';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import ScreenContainer from 'src/components/ScreenContainer';
import SelectOption from 'src/components/SelectOption';
import { hp, windowHeight } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import useWallets from 'src/hooks/useWallets';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import InsufficiantBalancePopupContainer from 'src/screens/collectiblesCoins/components/InsufficiantBalancePopupContainer';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { AppTheme } from 'src/theme';

function AddAsset() {
  const navigation = useNavigation();
  const wallet: Wallet = useWallets({}).wallets[0];
  const { translations } = useContext(LocalizationContext);
  const { home, common } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [visible, setVisible] = useState(false);

  return (
    <ScreenContainer>
      <AppHeader title={home.addAssets} subTitle={home.addAssetSubTitle} />
      <View style={styles.container}>
        <SelectOption
          title={home.issueNew}
          backColor={theme.colors.inputBackground}
          style={styles.optionStyle}
          onPress={() => {
            if (
              wallet &&
              wallet.specs.balances.confirmed +
                wallet.specs.balances.unconfirmed ===
                0
            ) {
              setVisible(true);
            } else {
              navigation.navigate(NavigationRoutes.ISSUESCREEN);
            }
          }}
          testID="issue_new"
        />
        <SelectOption
          title={home.addAssets}
          backColor={theme.colors.inputBackground}
          style={styles.optionStyle}
          onPress={() => {
            if (
              wallet &&
              wallet.specs.balances.confirmed +
                wallet.specs.balances.unconfirmed ===
                0
            ) {
              setVisible(true);
            } else {
              navigation.navigate(NavigationRoutes.RECEIVEASSET, {
                refresh: true,
              });
            }
          }}
          testID="receive"
        />
      </View>
      <View>
        <ResponsePopupContainer
          visible={visible}
          enableClose={true}
          onDismiss={() => setVisible(false)}
          backColor={theme.colors.cardGradient1}
          borderColor={theme.colors.borderColor}>
          <InsufficiantBalancePopupContainer
            primaryOnPress={() => {
              setVisible(false);
              setTimeout(() => {
                navigation.replace(NavigationRoutes.RECEIVESCREEN);
              }, 500);
            }}
            secondaryOnPress={() => setVisible(false)}
          />
        </ResponsePopupContainer>
      </View>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: hp(25),
    },
    optionStyle: {
      marginVertical: hp(10),
      paddingHorizontal: 20,
      paddingVertical: windowHeight > 650 ? 25 : 20,
    },
  });
export default AddAsset;
