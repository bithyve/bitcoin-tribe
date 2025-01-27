import React, { useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, FlatList, Platform, RefreshControl } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMutation } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useQuery } from '@realm/react';

import SegmentedButtons from 'src/components/SegmentedButtons';
import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { ApiHandler } from 'src/services/handler/apiHandler';
import {
  Asset,
  Coin,
  Collectible,
  UtxoType,
} from 'src/models/interfaces/RGBWallet';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import openLink from 'src/utils/OpenLink';
import config from 'src/utils/config';
import { NetworkType } from 'src/services/wallets/enums';
import AppTouchable from 'src/components/AppTouchable';
import UnspentUTXOElement from './UnspentUTXOElement';
import EmptyStateView from 'src/components/EmptyStateView';
import NoTransactionIllustration from 'src/assets/images/noTransaction.svg';
import NoTransactionIllustrationLight from 'src/assets/images/noTransaction_light.svg';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';
import { Keys } from 'src/storage';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import RefreshControlView from 'src/components/RefreshControlView';

const getStyles = (theme: AppTheme) => StyleSheet.create({});

const ViewUnspentScreen = () => {
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { translations } = useContext(LocalizationContext);
  const { wallet, assets } = translations || { wallet: {}, assets: {} };
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [utxoType, setUtxoType] = useState<UtxoType>(UtxoType.Coloured);
  const [refreshing, setRefreshing] = useState(false);

  const app: TribeApp | undefined = useQuery(RealmSchema.TribeApp)[0];
  const coins = useQuery<Coin[]>(RealmSchema.Coin);
  const collectibles = useQuery<Collectible[]>(RealmSchema.Collectible);
  const combined: Asset[] = useMemo(
    () => [...coins, ...collectibles],
    [coins, collectibles],
  );

  const storedWallet = dbManager.getObjectByIndex(RealmSchema.RgbWallet);
  const UnspentUTXOData = useMemo(() => {
    if (!storedWallet || !storedWallet.utxos) return [];
    return storedWallet.utxos.map(utxoStr => JSON.parse(utxoStr));
  }, [storedWallet]);

  const colorableUTXOs = UnspentUTXOData.filter(
    utxo => utxo.utxo.colorable === true,
  );
  const unColorableUTXOs = UnspentUTXOData.filter(
    utxo => utxo.utxo.colorable === false,
  );

  const { mutate, isLoading } = useMutation(ApiHandler.viewUtxos);

  useEffect(() => {
    mutate();
  }, [mutate]);

  const redirectToBlockExplorer = (txid: string) => {
    openLink(
      `https://mempool.space${
        config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
      }/tx/${txid}`,
    );
  };
  const pullDownToRefresh = () => {
    setRefreshing(true);
    mutate();
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={wallet.unspentTitle || 'Unspent Outputs'}
        enableBack={true}
      />
      <SegmentedButtons
        value={utxoType}
        onValueChange={value => {
          if (value !== utxoType) {
            setUtxoType(value);
          } else {
          }
        }}
        buttons={[
          {
            value: UtxoType.Coloured,
            label: wallet.coloured,
          },
          {
            value: UtxoType.Uncoloured,
            label: wallet.unColoured,
          },
        ]}
      />
      <FlatList
        data={
          utxoType === UtxoType.Coloured ? colorableUTXOs : unColorableUTXOs
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          Platform.OS === 'ios' ? (
            <RefreshControlView
              refreshing={refreshing}
              onRefresh={() => pullDownToRefresh()}
            />
          ) : (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => pullDownToRefresh()}
              colors={[theme.colors.accent1]}
              progressBackgroundColor={theme.colors.inputBackground}
            />
          )
        }
        renderItem={({ item }) => (
          <AppTouchable
            onPress={() => redirectToBlockExplorer(item.utxo.outpoint.txid)}>
            <UnspentUTXOElement
              transID={
                app?.appType === AppType.NODE_CONNECT
                  ? `${item.utxo.outpoint}`
                  : `${item.utxo.outpoint.txid}:${item.utxo.outpoint.vout}`
              }
              satsAmount={`${item.utxo.btcAmount}`}
              rgbAllocations={item.rgbAllocations || []}
              assets={combined || []}
              colourable={item?.utxo.colorable}
            />
          </AppTouchable>
        )}
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
    </ScreenContainer>
  );
};

export default ViewUnspentScreen;
