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

const CoinDetailsScreen = () => {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { assetId } = useRoute().params;
  const coin = useObject<Coin>(RealmSchema.Coin, assetId);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);

  useEffect(() => {
    mutate({ assetId });
  }, []);

  return (
    <ScreenContainer>
      <View style={styles.walletHeaderWrapper}>
        <CoinDetailsHeader
          coin={coin}
          onPressSetting={() =>
            navigation.navigate(NavigationRoutes.COINMETADATA, { assetId })
          }
          onPressBuy={() => {}}
        />
      </View>
      <TransactionsList
        transactions={coin.transactions}
        isLoading={isLoading}
        refresh={() => mutate({ assetId })}
      />
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
    height: windowHeight < 650 ? '42%' : '35%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(25),
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
  },
  walletTransWrapper: {
    height: windowHeight < 650 ? '53%' : '65%',
    marginHorizontal: wp(25),
  },
});
