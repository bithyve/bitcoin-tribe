import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Platform,
  RefreshControl,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from 'src/components/AppText';
import { hp, windowHeight } from 'src/constants/responsive';
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
import { filterGasFreeTransfers } from 'src/utils/gasFreeTransactions';

/** Fixed row height aligned with AssetTransaction (padding + two lines + divider). */
const TRANSACTION_ROW_HEIGHT = hp(76);

/** Matches `CustomTab` tabBar vertical footprint (bottom offset + height + marginBottom). */
function bottomTabReserveHeight(): number {
  const tabBottomOffset = windowHeight > 670 ? hp(15) : hp(5);
  const tabBarHeight = hp(68);
  const tabMarginBottom = Platform.OS === 'ios' ? hp(15) : hp(35);
  return tabBottomOffset + tabBarHeight + tabMarginBottom;
}

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
  limitToVisibleRows,
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
  /**
   * When true, only the latest N rows are rendered. Row count is taken from the **first**
   * successful FlatList `onLayout` and then kept fixed so adding/removing sibling views does
   * not change how many items show. Until that layout, a window heuristic is used.
   */
  limitToVisibleRows?: boolean;
}) {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const navigation = useNavigation();
  const { height: windowH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  /** Set once from first `onLayout`; never updated on later layouts. */
  const [lockedRowCap, setLockedRowCap] = useState<number | null>(null);
  /** First computed fallback for this limit session; avoids cap flicker before layout. */
  const frozenFallbackCapRef = useRef<number | null>(null);

  useEffect(() => {
    if (!limitToVisibleRows) {
      setLockedRowCap(null);
      frozenFallbackCapRef.current = null;
    }
  }, [limitToVisibleRows]);

  const onFlatListLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (!limitToVisibleRows) {
        return;
      }
      setLockedRowCap(prev => {
        if (prev !== null) {
          return prev;
        }
        const h = e.nativeEvent.layout.height;
        if (h <= 0) {
          return prev;
        }
        return Math.max(3, Math.floor(h / TRANSACTION_ROW_HEIGHT));
      });
    },
    [limitToVisibleRows],
  );

  const fallbackMaxRows = useMemo(() => {
    const tabAndSafe = bottomTabReserveHeight() + insets.bottom;
    const approxListBody = Math.max(
      0,
      windowH - insets.top - tabAndSafe - windowH * 0.52,
    );
    return Math.max(
      4,
      Math.min(40, Math.floor(approxListBody / TRANSACTION_ROW_HEIGHT)),
    );
  }, [windowH, insets.top, insets.bottom]);

  if (limitToVisibleRows && frozenFallbackCapRef.current === null) {
    frozenFallbackCapRef.current = fallbackMaxRows;
  }

  const visibleRowCap = useMemo(() => {
    if (!limitToVisibleRows) {
      return null;
    }
    if (lockedRowCap !== null) {
      return lockedRowCap;
    }
    return frozenFallbackCapRef.current ?? fallbackMaxRows;
  }, [limitToVisibleRows, lockedRowCap, fallbackMaxRows]);

  const filteredTransactions = useMemo(() => {
    const list = filterGasFreeTransfers(transactions).reverse();
    if (limitToVisibleRows && visibleRowCap != null) {
      return list.slice(0, visibleRowCap);
    }
    return list;
  }, [transactions, limitToVisibleRows, visibleRowCap]);

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
              name: coin,
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
        onLayout={limitToVisibleRows ? onFlatListLayout : undefined}
        style={styles.container2}
        data={filteredTransactions}
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
              });
            }}
            precision={precision}
          />
        )}
        keyExtractor={(item, index) => `${item.txid}-${index}`}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyStateView title={''} subTitle={''} />}
      />
    </View>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
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
