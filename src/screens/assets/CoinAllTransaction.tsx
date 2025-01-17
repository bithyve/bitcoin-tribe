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
import NoTransactionIllustration from 'src/assets/images/noTransaction.svg';
import AssetTransaction from '../wallet/components/AssetTransaction';
import { FlatList, Platform, RefreshControl, StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';
import RefreshControlView from 'src/components/RefreshControlView';

function CoinAllTransaction() {
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations, settings } = translations;
  const { assetId, transactions, assetName } = useRoute().params;
  const { mutate, isLoading } = useMutation(ApiHandler.getAssetTransactions);
  return (
    <ScreenContainer>
      <AppHeader title={walletTranslations.transferDetails} />
      <FlatList
        style={styles.container}
        data={transactions}
        refreshControl={
          Platform.OS === 'ios' ? (
            <RefreshControlView
              refreshing={isLoading}
              onRefresh={() => mutate({ assetId })}
            />
          ) : (
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => mutate({ assetId })}
              colors={[theme.colors.accent1]} // You can customize this part
              progressBackgroundColor={theme.colors.inputBackground}
            />
          )
        }
        renderItem={({ item }) => (
          <AssetTransaction transaction={item} coin={assetName} />
        )}
        keyExtractor={item => item.txid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyStateView
            IllustartionImage={<NoTransactionIllustration />}
            title={walletTranslations.noUTXOYet}
            subTitle={walletTranslations.noUTXOYetSubTitle}
          />
        }
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
