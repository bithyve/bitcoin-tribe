import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import AppHeader from 'src/components/AppHeader';

import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { useRoute } from '@react-navigation/native';
import { useObject } from '@realm/react';
import { useMutation } from 'react-query';
import { Coin } from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import { ApiHandler } from 'src/services/handler/apiHandler';
import EmptyStateView from 'src/components/EmptyStateView';
import AssetTransaction from '../wallet/components/AssetTransaction';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';

function CoinAllTransaction() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations } = translations;
  const { assetId, transactions } = useRoute().params;
  const coin = useObject<Coin>(RealmSchema.Coin, assetId);
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  return (
    <ScreenContainer>
      <AppHeader
        title={walletTranslations.transferDetails}
        subTitle={walletTranslations.transactionDetailSubTitle}
      />
      <FlatList
        style={styles.container}
        data={transactions}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => mutate({ assetId })}
            tintColor={theme.colors.primaryCTA}
          />
        }
        renderItem={({ item }) => (
          <AssetTransaction
            transId={item.status.toUpperCase()}
            transDate={item.createdAt}
            transAmount={`${item.amount}`}
            transType={item.kind}
            transaction={item}
            coin={coin && coin.ticker}
          />
        )}
        keyExtractor={item => item.txid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyStateView title={''} subTitle={''} />}
      />
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: hp(10),
      height: '100%',
    },
  });
export default CoinAllTransaction;
