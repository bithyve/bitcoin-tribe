import React, { useContext } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Platform,
  RefreshControl,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import AppText from 'src/components/AppText';
import { hp } from 'src/constants/responsive';
import { AppTheme } from 'src/theme';
import AppTouchable from 'src/components/AppTouchable';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { Transfer } from 'src/models/interfaces/RGBWallet';
import EmptyStateView from 'src/components/EmptyStateView';
import AssetTransaction from '../wallet/components/AssetTransaction';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import RefreshControlView from 'src/components/RefreshControlView';
import LoadingSpinner from 'src/components/LoadingSpinner';
import InfoIcon from 'src/assets/images/infoIcon2.svg';
import InfoIconLight from 'src/assets/images/infoIcon2_light.svg';
import { Keys } from 'src/storage';

function TransactionsList({
  transactions,
  isLoading,
  refresh,
  refreshingStatus,
  coin,
  assetId = '',
  style,
  precision,
  schema,
}: {
  transactions: Transfer[];
  isLoading: boolean;
  refresh: () => void;
  refreshingStatus?: boolean;
  coin: string;
  assetId: string;
  style?: StyleProp<ViewStyle>;
  precision: number;
  schema: string;
}) {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const navigation = useNavigation();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.contentWrapper}>
        <View style={styles.contentWrapper1}>
          <AppText variant="heading3" style={styles.recentTransText}>
            {walletTranslations.recentTransaction}
          </AppText>
          <AppTouchable
            onPress={() =>
              navigation.navigate(NavigationRoutes.TRANSACTIONTYPEINFO)
            }>
            {isThemeDark ? <InfoIcon /> : <InfoIconLight />}
          </AppTouchable>
        </View>
        <AppTouchable
          onPress={() => {
            navigation.navigate(NavigationRoutes.COINALLTRANSACTION, {
              assetId: assetId,
              schema: schema,
            });
          }}>
          <AppText variant="body1" style={styles.viewAllText}>
            {walletTranslations.viewAll}
          </AppText>
        </AppTouchable>
      </View>
      {isLoading && !refreshingStatus ? <LoadingSpinner /> : null}
      <FlatList
        // onScroll={Animated.event(
        //   [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        //   { useNativeDriver: false },
        // )}
        style={styles.container2}
        data={transactions}
        refreshControl={
          Platform.OS === 'ios' ? (
            <RefreshControlView
              refreshing={refreshingStatus}
              onRefresh={() => refresh()}
            />
          ) : (
            <RefreshControl
              refreshing={refreshingStatus}
              onRefresh={() => refresh()}
              colors={[theme.colors.accent1]} // You can customize this part
              progressBackgroundColor={theme.colors.inputBackground}
            />
          )
        }
        renderItem={({ item }) => (
          <AssetTransaction
            transaction={item}
            coin={coin}
            onPress={() => {
              navigation.navigate(NavigationRoutes.TRANSFERDETAILS, {
                transaction: item,
                coin: coin,
                assetId: assetId,
                precision: precision,
                schema,
                assetId
              });
            }}
            precision={precision}
          />
        )}
        keyExtractor={item => item.txid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyStateView title={''} subTitle={''} />}
      />
    </View>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: '47%',
    },
    container2: {
      marginTop: hp(15),
      height: '100%',
    },
    contentWrapper: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    contentWrapper1: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    recentTransText: {
      color: theme.colors.secondaryHeadingColor,
      marginRight: hp(5),
    },
    viewAllText: {
      color: theme.colors.accent1,
    },
  });
export default TransactionsList;
