import React, { useContext, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMutation, UseMutationResult } from 'react-query';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useQuery } from '@realm/react';

import ScreenContainer from 'src/components/ScreenContainer';
import AppHeader from 'src/components/AppHeader';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RgbUnspent } from 'src/models/interfaces/RGBWallet';
import { AppTheme } from 'src/theme';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import openLink from 'src/utils/OpenLink';
import config from 'src/utils/config';
import { NetworkType } from 'src/services/wallets/enums';
import AppTouchable from 'src/components/AppTouchable';
import UnspentUTXOElement from './UnspentUTXOElement';
// import ModalLoading from 'src/components/ModalLoading';
import EmptyStateView from 'src/components/EmptyStateView';
import NoTransactionIllustration from 'src/assets/images/noTransaction.svg';
import NoTransactionIllustrationLight from 'src/assets/images/noTransaction_light.svg';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';
import { Keys } from 'src/storage';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';

const getStyles = (theme: AppTheme) => StyleSheet.create({});

const ViewUnspentScreen = () => {
  const { mutate, data, isLoading }: UseMutationResult<RgbUnspent[]> =
    useMutation(ApiHandler.viewUtxos);
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const theme: AppTheme = useTheme();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { wallet, assets } = translations;

  const storedWallet = dbManager.getObjectByIndex(RealmSchema.RgbWallet);
  // Deserialize each UTXO string back into an object
  const UnspentUTXOData = storedWallet.utxos.map(utxoStr =>
    JSON.parse(utxoStr),
  );
  useEffect(() => {
    mutate();
  }, []);

  // useEffect(() => {
  //   console.log('data', JSON.stringify(data));
  // }, [data]);

  const redirectToBlockExplorer = txid => {
    openLink(
      `https://mempool.space${
        config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
      }/tx/${txid}`,
    );
  };

  return (
    <ScreenContainer>
      <AppHeader title={wallet.unspentTitle} subTitle={''} enableBack={true} />
      {/* {isLoading ? (
        <ModalLoading visible={isLoading} />
      ) : ( */}
      <FlatList
        data={UnspentUTXOData}
        renderItem={({ item }) => (
          <AppTouchable
            onPress={() => redirectToBlockExplorer(item.utxo.outpoint.txid)}>
            <UnspentUTXOElement
              transID={
                app.appType === AppType.NODE_CONNECT
                  ? `${item.utxo.outpoint}`
                  : `${item.utxo.outpoint.txid}:${item.utxo.outpoint.vout}`
              }
              satsAmount={`${item.utxo.btcAmount}`}
              assetID={item.rgbAllocations && item.rgbAllocations}
            />
          </AppTouchable>
        )}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <EmptyStateView
            title={assets.noRGBUTXOsTitle}
            subTitle={assets.noRGBUTXOSubTitle}
            IllustartionImage={
              !isThemeDark ? (
                <NoTransactionIllustration />
              ) : (
                <NoTransactionIllustrationLight />
              )
            }
          />
        }
      />
      {/* )} */}
    </ScreenContainer>
  );
};

export default ViewUnspentScreen;
