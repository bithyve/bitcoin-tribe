import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useQuery } from '@realm/react';
import { useNavigation } from '@react-navigation/native';

import { ApiHandler } from 'src/services/handler/apiHandler';
import {
  Asset,
  Coin,
  Collectible,
  Collection,
  RgbUnspent,
  RGBWallet,
  UniqueDigitalAsset,
  UtxoType,
} from 'src/models/interfaces/RGBWallet';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import config from 'src/utils/config';
import { NetworkType } from 'src/services/wallets/enums';
import AppTouchable from 'src/components/AppTouchable';
import UnspentUTXOElement from '../UnspentUTXOElement';
import EmptyStateView from 'src/components/EmptyStateView';
import NoTransactionIllustration from 'src/assets/images/noTransaction.svg';
import NoTransactionIllustrationLight from 'src/assets/images/noTransaction_light.svg';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';
import { Keys } from 'src/storage';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import RefreshControlView from 'src/components/RefreshControlView';
import { windowHeight } from 'src/constants/responsive';
import Toast from 'src/components/Toast';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';

const ColoredUTXO = () => {
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { wallet, assets } = translations || { wallet: {}, assets: {} };
  const [visibleUTXOInfo, setVisibleUTXOInfo] = useState(false);
  const app: TribeApp | undefined = useQuery(RealmSchema.TribeApp)[0];
  const coins = useQuery<Coin[]>(RealmSchema.Coin);
  const collectibles = useQuery<Collectible[]>(RealmSchema.Collectible);
  const udas = useQuery<UniqueDigitalAsset[]>(RealmSchema.UniqueDigitalAsset);
  const collections = useQuery<Collection[]>(RealmSchema.Collection); 
  const combined: Asset[] = useMemo(
    () => [...coins, ...collectibles, ...udas, ...collections],
    [coins, collectibles, udas, collections],
  );
  const rgbWallet: RGBWallet = dbManager.getObjectByIndex(
    RealmSchema.RgbWallet,
  );
  const unspent: RgbUnspent[] = useMemo(() => {
    if (!rgbWallet || !rgbWallet.utxos) return [];
    return rgbWallet.utxos.map(utxo => JSON.parse(utxo));
  }, [rgbWallet]);
  const colored = unspent?.filter(
      utxo =>
        utxo.utxo.colorable === true &&
        utxo.rgbAllocations?.length > 0 &&
        utxo.rgbAllocations[0]?.assetId !== null,
    );
  const { mutate, isLoading } = useMutation(ApiHandler.viewUtxos);

  useEffect(() => {
    mutate();
  }, [mutate]);
  const redirectToBlockExplorer = (txid: string) => {
    if (config.NETWORK_TYPE !== NetworkType.REGTEST) {
      const url = `https://mempool.space${
        config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
      }/tx/${txid}`;

      navigation.navigate(NavigationRoutes.WEBVIEWSCREEN, {
        url,
        title: 'Transaction Details',
      });
    } else {
      Toast('Explorer not available!', true);
    }
  };
  const pullDownToRefresh = () => {
    mutate();
  };
  const FooterComponent = () => {
    return <View style={styles.footer} />;
  };
  return (
    <FlatList
      data={colored}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <AppTouchable
          onPress={() => redirectToBlockExplorer(item.utxo.outpoint.txid)}>
          <UnspentUTXOElement
            transID={
              app?.appType === AppType.NODE_CONNECT ||
              app.appType === AppType.SUPPORTED_RLN
                ? `${item.utxo.outpoint}`
                : `${item.utxo.outpoint.txid}:${item.utxo.outpoint.vout}`
            }
            satsAmount={`${item.utxo.btcAmount}`}
            rgbAllocations={item.rgbAllocations || []}
            assets={combined || []}
            mode={UtxoType.Colored}
          />
        </AppTouchable>
      )}
      ListFooterComponent={FooterComponent}
      refreshControl={
        Platform.OS === 'ios' ? (
          <RefreshControlView
            refreshing={isLoading}
            onRefresh={() => pullDownToRefresh()}
          />
        ) : (
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => pullDownToRefresh()}
            colors={[theme.colors.accent1]}
            progressBackgroundColor={theme.colors.inputBackground}
          />
        )
      }
      keyExtractor={(item, index) => index.toString()}
      ListEmptyComponent={
        <EmptyStateView
          title={assets.noRGBUTXOsTitle}
          subTitle={assets.noRGBUTXOSubTitle}
          IllustartionImage={
            isThemeDark ? (
              <NoTransactionIllustration />
            ) : (
              <NoTransactionIllustrationLight />
            )
          }
        />
      }
    />
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    footer: {
      height: windowHeight > 670 ? 100 : 70,
    },
  });
export default ColoredUTXO;
