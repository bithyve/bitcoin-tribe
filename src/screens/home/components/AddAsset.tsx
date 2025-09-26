import { useNavigation } from '@react-navigation/native';
import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';
import ResponsePopupContainer from 'src/components/ResponsePopupContainer';
import ScreenContainer from 'src/components/ScreenContainer';
import SelectOption from 'src/components/SelectOption';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import useWallets from 'src/hooks/useWallets';
import {
  AssetType,
  RgbUnspent,
  RGBWallet,
} from 'src/models/interfaces/RGBWallet';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';
import { AppTheme } from 'src/theme';
import InsufficiantBalancePopupContainer from 'src/screens/collectiblesCoins/components/InsufficiantBalancePopupContainer';
import AppType from 'src/models/enums/AppType';
import { TribeApp } from 'src/models/interfaces/TribeApp';

function AddAsset() {
  const navigation = useNavigation();
  const wallet: Wallet = useWallets({}).wallets[0];
  const { translations } = useContext(LocalizationContext);
  const { home, assets } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [visible, setVisible] = useState(false);
  const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
    RealmSchema.RgbWallet,
  );
  const app: TribeApp = dbManager.getObjectByIndex(RealmSchema.TribeApp);
  const unspent: RgbUnspent[] = rgbWallet.utxos.map(utxoStr =>
    JSON.parse(utxoStr),
  );
  const colorable = unspent.filter(
    utxo => utxo.utxo.colorable === true && utxo.rgbAllocations?.length === 0,
  );


  const canProceed = useMemo(() => {
    if (
      app.appType === AppType.NODE_CONNECT ||
      app.appType === AppType.SUPPORTED_RLN
    ) {
      return (
        rgbWallet?.nodeBtcBalance?.vanilla?.spendable +
          rgbWallet?.nodeBtcBalance?.vanilla?.future >
        0
      );
    }
    return (
      wallet?.specs.balances.confirmed + wallet?.specs.balances.unconfirmed >
        0 || colorable.length > 0
    );
  }, [
    colorable.length,
    wallet?.specs.balances.confirmed,
    wallet?.specs.balances.unconfirmed,
    rgbWallet?.nodeBtcBalance?.vanilla?.spendable,
  ]);

  const navigateToIssue = useCallback(
    (addToRegistry: boolean, issueAssetType) => {
      setTimeout(() => {
        if (issueAssetType === AssetType.Coin) {
          navigation.replace(NavigationRoutes.ISSUESCREEN, {
            issueAssetType,
            addToRegistry,
          });
        } else {
          navigation.replace(NavigationRoutes.ISSUECOLLECTIBLESCREEN, {
            issueAssetType,
            addToRegistry,
          });
        }
      }, 500);
    },
    [navigation],
  );

  return (
    <ScreenContainer>
      <AppHeader title={home.createAssets} subTitle={home.addAssetSubTitle} />

      <View style={styles.container}>
        <SelectOption
          title={assets.issueNewCoin}
          backColor={theme.colors.inputBackground}
          style={styles.optionStyle}
          onPress={() => {
            if (!canProceed) {
              setVisible(true);
            } else {
              navigateToIssue(false, AssetType.Coin);
            }
          }}
          testID="issue_new"
        />

        <SelectOption
          title={assets.issueCollectibles}
          backColor={theme.colors.inputBackground}
          style={styles.optionStyle}
          onPress={() => {
            if (!canProceed) {
              setVisible(true);
            } else {
              navigateToIssue(false, AssetType.Collectible);
            }
          }}
          testID="issue_new"
        />
        <SelectOption
          title={home.addAssets}
          backColor={theme.colors.inputBackground}
          style={styles.optionStyle}
          onPress={() => {
            if (!canProceed) {
              setVisible(true);
            } else {
              navigation.replace(NavigationRoutes.ENTERINVOICEDETAILS, {
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
      paddingTop: hp(20),
    },
    optionStyle: {
      marginVertical: hp(5),
      paddingHorizontal: 20,
    },
    labelWrapper: {
      width: '45%',
    },
    valueWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: '55%',
    },
    labelText: {
      color: theme.colors.headingColor,
    },
  });

export default AddAsset;
