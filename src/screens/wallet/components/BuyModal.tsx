import React, { useContext } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import IconRamp from 'src/assets/images/icon_ramp.svg';
import SelectOption from 'src/components/SelectOption';
import { hp, windowHeight } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import useWallets from 'src/hooks/useWallets';
import { fetchRampReservation } from 'src/services/thirdparty/ramp';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletOperations from 'src/services/wallets/operations';
import { AppTheme } from 'src/theme';

function BuyModal() {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const wallet: Wallet = useWallets({}).wallets[0];

  const redirectBuyBtc = () => {
    const { receivingAddress } =
      WalletOperations.getNextFreeExternalAddress(wallet);
    const rampUrl = fetchRampReservation({ receiveAddress: receivingAddress });
    if (typeof rampUrl === 'string') {
      Linking.openURL(rampUrl);
    } else {
      console.error('Ramp URL generation failed:', rampUrl.error);
    }
  };

  return (
    <View style={styles.container}>
      <SelectOption
        title={walletTranslations.buyWithRamp}
        subTitle={walletTranslations.buyWithRampSubTitle}
        icon={<IconRamp />}
        backColor={theme.colors.inputBackground}
        style={styles.optionStyle}
        onPress={redirectBuyBtc}
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: hp(25),
      paddingBottom: hp(25),
    },
    optionStyle: {
      marginVertical: 10,
      paddingHorizontal: 20,
      paddingVertical: windowHeight > 650 ? 25 : 20,
    },
  });
export default BuyModal;
