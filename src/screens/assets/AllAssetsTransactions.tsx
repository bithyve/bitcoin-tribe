import React, { useContext, useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { FlatList, Platform, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { AppTheme } from 'src/theme';
import EmptyStateView from 'src/components/EmptyStateView';
import NoTransactionIllustration from 'src/assets/images/noTransaction.svg';
import NoTransactionIllustrationLight from 'src/assets/images/noTransaction_light.svg';
import AssetTransaction from '../wallet/components/AssetTransaction';
import { hp } from 'src/constants/responsive';
import RefreshControlView from 'src/components/RefreshControlView';
import { Keys } from 'src/storage';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import {
  AssetVisibility,
  Coin,
  Collectible,
  Collection,
  InflatableFungibleAsset,
  UniqueDigitalAsset,
} from 'src/models/interfaces/RGBWallet';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { buildAllAssetsTransactions } from 'src/utils/allAssetsTransactions';
import DeepLinking from 'src/utils/DeepLinking';

function AllAssetsTransactions() {
  const theme: AppTheme = useTheme();
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const styles = getStyles(theme);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations } = translations;

  const coins = useQuery<Coin>(RealmSchema.Coin, collection =>
    collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );
  const collectibles = useQuery<Collectible>(
    RealmSchema.Collectible,
    collection =>
      collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );
  const udas = useQuery<UniqueDigitalAsset>(
    RealmSchema.UniqueDigitalAsset,
    collection =>
      collection.filtered(
        `visibility != $0 && NOT details CONTAINS '${DeepLinking.appLinkScheme}'`,
        AssetVisibility.HIDDEN,
      ),
  );
  const collections = useQuery<Collection>(
    RealmSchema.Collection,
    collection =>
      collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );
  const ifaCoins = useQuery<InflatableFungibleAsset>(
    RealmSchema.IFA,
    collection =>
      collection.filtered(`visibility != $0`, AssetVisibility.HIDDEN),
  );

  const allTransactions = useMemo(
    () =>
      buildAllAssetsTransactions([
        { assets: coins, schema: RealmSchema.Coin },
        { assets: collectibles, schema: RealmSchema.Collectible },
        { assets: udas, schema: RealmSchema.UniqueDigitalAsset },
        { assets: collections, schema: RealmSchema.Collection },
        { assets: ifaCoins, schema: RealmSchema.IFA },
      ]),
    [coins, collectibles, udas, collections, ifaCoins],
  );

  return (
    <ScreenContainer>
      <AppHeader title={walletTranslations.recentActivity} />
      <FlatList
        style={styles.container}
        data={allTransactions}
        refreshControl={
          Platform.OS === 'ios' ? (
            <RefreshControlView refreshing={false} onRefresh={() => {}} />
          ) : (
            <RefreshControl
              refreshing={false}
              onRefresh={() => {}}
              colors={[theme.colors.accent1]}
              progressBackgroundColor={theme.colors.inputBackground}
            />
          )
        }
        renderItem={({ item }) => (
          <AssetTransaction
            transaction={item}
            coin={item.assetName}
            precision={item.assetPrecision}
            onPress={() => {
              navigation.navigate(NavigationRoutes.TRANSFERDETAILS, {
                transaction: item,
                coin: item.assetName,
                precision: item.assetPrecision,
                schema: item.assetSchema,
                assetId: item.assetId,
              });
            }}
          />
        )}
        keyExtractor={(item, index) => `${item.txid}-${index}`}
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

export default AllAssetsTransactions;
