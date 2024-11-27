import React, { useContext } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AppText from 'src/components/AppText';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import TransactionButtons from '../wallet/components/TransactionButtons';
import { Collectible } from 'src/models/interfaces/RGBWallet';
import Toolbar from './Toolbar';
import { numberWithCommas } from 'src/utils/numberWithCommas';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { AppContext } from 'src/contexts/AppContext';
import AppType from 'src/models/enums/AppType';

type CollectibleDetailsHeaderProps = {
  collectible: Collectible;
  wallet: Wallet;
  onPressSetting: () => void;
  onPressBuy?: () => void;
};

function CollectibleDetailsHeader(props: CollectibleDetailsHeaderProps) {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { home } = translations;
  const { collectible, onPressSetting, wallet } = props;
  const { appType } = useContext(AppContext);

  return (
    <View style={styles.container}>
      <Toolbar onPress={onPressSetting} ticker={collectible.name} />
      <Image
        source={{
          uri: Platform.select({
            android: `file://${collectible.media?.filePath}`,
            ios: collectible.media?.filePath,
          }),
        }}
        style={styles.imageStyle}
      />
      <View>
        <AppText variant="body2" style={styles.totalBalText}>
          {home.totalBalance}
        </AppText>
      </View>
      <View style={styles.balanceWrapper}>
        <AppText variant="walletBalance" style={styles.balanceText}>
          {numberWithCommas(collectible.balance.spendable)}
        </AppText>
      </View>
      <TransactionButtons
        onPressSend={() =>
          navigation.navigate(NavigationRoutes.SCANASSET, {
            assetId: collectible.assetId,
            item: collectible,
            rgbInvoice: '',
            wallet: wallet,
          })
        }
        // onPressBuy={onPressBuy}
        onPressRecieve={() =>
          navigation.navigate(NavigationRoutes.RECEIVEASSET, {
            refresh: true,
          })
        }
      />
    </View>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      width: '100%',
      marginTop: Platform.OS === 'android' ? hp(20) : 0,
      paddingBottom: 10,
    },
    usernameText: {
      color: theme.colors.accent3,
      textAlign: 'center',
      marginVertical: 10,
    },
    balanceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(10),
    },
    balanceText: {
      color: theme.colors.headingColor,
    },
    imageStyle: {
      width: 80,
      height: 80,
      borderRadius: 10,
      backgroundColor: theme.colors.inputBackground,
    },
    totalBalText: {
      color: theme.colors.secondaryHeadingColor,
      fontWeight: '400',
      marginTop: hp(10),
    },
  });
export default CollectibleDetailsHeader;
