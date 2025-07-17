import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useMutation } from 'react-query';
import { FlatList, Platform, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import { ApiHandler } from 'src/services/handler/apiHandler';
import EmptyStateView from 'src/components/EmptyStateView';
import NoTransactionIllustration from 'src/assets/images/noTransaction.svg';
import NoTransactionIllustrationLight from 'src/assets/images/noTransaction_light.svg';
import AssetTransaction from '../wallet/components/AssetTransaction';
import { hp } from 'src/constants/responsive';
import RefreshControlView from 'src/components/RefreshControlView';
import { Keys } from 'src/storage';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import { Transfer } from 'src/models/interfaces/RGBWallet';

function CoinAllTransaction() {
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations } = translations;
  const { assetId, transactions, assetName, precision } = useRoute().params as { assetId: string, transactions: Transfer[], assetName: string, precision: number };
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
          <AssetTransaction
            transaction={item}
            coin={assetName}
            precision={precision}
            onPress={() => {
              navigation.navigate(NavigationRoutes.TRANSFERDETAILS, {
                transaction: item,
                coin: assetName,
                precision: precision,
              });
            }}
          />
        )}
        keyExtractor={item => item.txid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyStateView
            IllustartionImage={
              isThemeDark ? (
                <NoTransactionIllustration />
              ) : (
                <NoTransactionIllustrationLight />
              )
            }
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
