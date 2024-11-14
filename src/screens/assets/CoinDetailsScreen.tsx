import { StyleSheet, View } from 'react-native';
import React, { useContext, useEffect } from 'react';
import ScreenContainer from 'src/components/ScreenContainer';
import { windowHeight, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useObject } from '@realm/react';
import { Coin } from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import CoinDetailsHeader from './CoinDetailsHeader';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import TransactionsList from './TransactionsList';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/services/wallets/interfaces/wallet';

const CoinDetailsScreen = () => {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { assetId } = useRoute().params;
  const wallet: Wallet = useWallets({}).wallets[0];
  const coin = useObject<Coin>(RealmSchema.Coin, assetId);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshRgbWallet.mutate();
      mutate({ assetId, schema: RealmSchema.Coin });
    });
    return unsubscribe;
  }, [navigation, assetId]);

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.walletHeaderWrapper}>
        <CoinDetailsHeader
          coin={coin}
          wallet={wallet}
          onPressSetting={() =>
            navigation.navigate(NavigationRoutes.COINMETADATA, { assetId })
          }
          onPressBuy={() => {}}
        />
      </View>
      <View style={styles.TransactionWrapper}>
        <TransactionsList
          transactions={coin?.transactions}
          isLoading={isLoading}
          refresh={() => {
            refreshRgbWallet.mutate();
            mutate({ assetId, schema: RealmSchema.Coin });
          }}
          navigation={navigation}
          wallet={wallet}
          coin={coin.ticker}
          assetId={assetId}
        />
      </View>
    </ScreenContainer>
  );
};

export default CoinDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    height: '100%',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  walletHeaderWrapper: {
    height: windowHeight < 670 ? '42%' : '35%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(25),
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
  },
  TransactionWrapper: {
    height: windowHeight < 670 ? '53%' : '60%',
    marginHorizontal: wp(25),
  },
});
