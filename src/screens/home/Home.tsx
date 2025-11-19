import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useTheme } from 'react-native-paper';
import {
  Alert,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { useMutation } from 'react-query';
import ScreenContainer from 'src/components/ScreenContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import CoinAssetsList from './components/CoinAssetsList';
import HomeHeader from './components/HomeHeader';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import { RealmSchema } from 'src/storage/enum';
import useWallets from 'src/hooks/useWallets';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { AppContext } from 'src/contexts/AppContext';
import {
  Asset,
  AssetType,
  AssetVisibility,
  Coin,
  WalletOnlineStatus,
} from 'src/models/interfaces/RGBWallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { VersionHistory } from 'src/models/interfaces/VersionHistory';
import AppType from 'src/models/enums/AppType';
import Toast from 'src/components/Toast';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import {
  NodeStatusType,
  PushNotificationType,
} from 'src/models/enums/Notifications';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { CommunityType, deeplinkType } from 'src/models/interfaces/Community';
import DefaultCoin from './DefaultCoin';
import RefreshControlView from 'src/components/RefreshControlView';
import { Keys, Storage } from 'src/storage';
import Deeplinking from 'src/utils/DeepLinking';
import { useMMKVBoolean } from 'react-native-mmkv';
import { HolepunchRoomType } from 'src/services/messaging/holepunch/storage/RoomStorage';

function HomeScreen() {
  const theme: AppTheme = useTheme();
  const prevStatusRef = useRef<string | null>(null);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { node } = translations;
  const [walletOnline, setWalletOnline] = useState(false);
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const latestVersion = useQuery<VersionHistory>(
    RealmSchema.VersionHistory,
  ).slice(-1)[0];
  const versionNumber = latestVersion?.version.match(/\((\d+)\)/)?.[1] || 'N/A';
  const navigation = useNavigation();
  const {
    key,
    setBackupProcess,
    setBackupDone,
    setManualAssetBackupStatus,
    isBackupInProgress,
    isBackupDone,
    setAppType,
    isNodeInitInProgress,
    setNodeInitStatus,
    setNodeConnected,
    setIsWalletOnline,
    isWalletOnline,
  } = useContext(AppContext);
  const presetAssets: Asset[] = JSON.parse(Storage.get(Keys.PRESET_ASSETS) as string || '[]');
  const [isFirstAppImageBackupCompleted, setIsFirstAppImageBackupCompleted]=useMMKVBoolean(Keys.FIRST_APP_IMAGE_BACKUP_COMPLETE)

  const { mutate: backupMutate, isLoading } = useMutation(ApiHandler.backup, {
    onSuccess: () => {
      setBackupDone(true);
      setTimeout(() => {
        setBackupDone(false);
        setManualAssetBackupStatus(true);
      }, 1500);
    },
  });
  const { mutate: checkBackupRequired, data: isBackupRequired } = useMutation(
    ApiHandler.isBackupRequired,
  );
  const { mutate: startNode } = useMutation({
    mutationFn: ({
      nodeId,
      authToken,
    }: {
      nodeId: string;
      authToken: string;
    }) => ApiHandler.startNode(nodeId, authToken),
  });
  const { mutate: listPaymentsMutate } = useMutation(
    ApiHandler.getAssetTransactions,
  );
  const { mutate: fetchUTXOs } = useMutation(ApiHandler.viewUtxos);
  const [refreshing, setRefreshing] = useState(false);
  const refreshWallet = useMutation(ApiHandler.refreshWallets);
  const wallet = useWallets({}).wallets[0];

  const coinsResult = useQuery<Coin>(RealmSchema.Coin, collection =>
    collection
      .filtered(`visibility != $0`, AssetVisibility.HIDDEN)
      .sorted('timestamp', true),
  );
  const coins = useMemo(() => {
    if (!coinsResult) return [];
    const coinsArray = coinsResult.slice();
    const defaultCoinIndex = coinsArray.findIndex(c => c.isDefault);
    if (defaultCoinIndex !== -1) {
      const [defaultCoin] = coinsArray.splice(defaultCoinIndex, 1);
      return [defaultCoin, ...coinsArray];
    }
    return coinsArray;
  }, [coinsResult]);

  useEffect(() => {
    ApiHandler.fetchPresetAssets();
  }, []);

  useEffect(() => {
    const initializeWalletOnline = async () => {
      if(isWalletOnline === WalletOnlineStatus.Online) return
      try {
        setIsWalletOnline(WalletOnlineStatus.InProgress);
        const response = await ApiHandler.makeWalletOnline();
        setWalletOnline(response.status);
        setIsWalletOnline(
          response.status
            ? WalletOnlineStatus.Online
            : WalletOnlineStatus.Error,
        );
        if (response.error) {
          Toast(response.error, true);
        }
        if (response.status) {
          refreshRgbWallet.mutate();
        }
      } catch (error) {
        console.error('Failed to make wallet online:', error);
        setIsWalletOnline(WalletOnlineStatus.Error);
      }
    };
    if (!walletOnline) {
      initializeWalletOnline();
    }
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      if (app.appType === AppType.SUPPORTED_RLN) {
        const status = await ApiHandler.checkNodeStatus(
          app?.id,
          app?.authToken,
        );
        const prevStatus = prevStatusRef.current;
        if (status === NodeStatusType.IN_PROGRESS) {
          setNodeInitStatus(true);
        } else if (status === NodeStatusType.PAUSED) {
          startNode;
        } else if (status === NodeStatusType.RUNNING) {
          await ApiHandler.saveNodeMnemonic(app?.id, app?.authToken);
          setNodeInitStatus(false);
          if (prevStatus === NodeStatusType.IN_PROGRESS) {
            setNodeConnected(true);
            setTimeout(() => {
              setNodeConnected(false);
            }, 1500);
          }
        } else {
          await ApiHandler.saveNodeMnemonic(app?.id, app?.authToken);
          setNodeInitStatus(false);
        }
        console.log('Node status:', status);
      }
    };

    fetchStatus();
  }, []);

  const refreshRgbWallet = useMutation({
    mutationFn: ApiHandler.refreshRgbWallet,
    onSuccess: () => {
      if (app?.appType === AppType.ON_CHAIN) {
        if (isWalletOnline === WalletOnlineStatus.Online) {
          checkBackupRequired();
        }
      }
    },
  });

  useFocusEffect(
    useCallback(() => {
      const firebaseApp = getApp();
      const messaging = getMessaging(firebaseApp);

      const unsubscribe = onMessage(messaging, async remoteMessage => {
        const { title, body } = remoteMessage.notification ?? {};
        const { type } = remoteMessage.data ?? {};
        switch (type?.toLowerCase()) {
          case PushNotificationType.NODE_INIT_COMPLETE:
            await ApiHandler.saveNodeMnemonic(app?.id, app?.authToken);
            setNodeInitStatus(false);
            setNodeConnected(true);
            setTimeout(() => {
              setNodeConnected(false);
            }, 1500);
            break;
          case PushNotificationType.NODE_PAUSED:
            startNode;
            break;
          default:
            break;
        }
      });

      return () => {
        unsubscribe();
      };
    }, []),
  );

  useEffect(() => {
    setBackupProcess(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (isBackupRequired) {
      backupMutate();
    }
  }, [isBackupRequired]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (walletOnline) {
        refreshRgbWallet.mutate();
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (Number(versionNumber) < 163) {
      Alert.alert(
        'Unsupported Version',
        'This version of Tribe is no longer supported. Please setup a new wallet to continue.',
        [
          {
            text: 'OK',
            onPress: () => {
              ApiHandler.resetApp(key);
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: NavigationRoutes.LOGINSTACK }],
                }),
              );
            },
          },
        ],
        { cancelable: false },
      );
    }
    setAppType(app?.appType);
    ApiHandler.checkVersion();
    ApiHandler.getFeeAndExchangeRates();
    ApiHandler.syncFcmToken();
    if (walletOnline) {
      fetchUTXOs();
      refreshWallet.mutate({ wallets: [wallet] });
    }
  }, [app?.appType, walletOnline]);

  const handleNavigation = (route, params?) => {
    navigation.dispatch(CommonActions.navigate(route, params));
  };

  const handleRefresh = () => {
    if (isBackupInProgress || isBackupDone || !walletOnline) {
      return;
    }
    setRefreshing(true);
    ApiHandler.fetchPresetAssets();
    refreshRgbWallet.mutate();
    checkBackupRequired();
    refreshWallet.mutate({ wallets: [wallet] });
    setTimeout(() => setRefreshing(false), 2000);
  };

    useEffect(() => {
    Linking.getInitialURL().then(url => { // cold start 
      if (url) handleDeepLink({ url });
    });
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = event => {
    try {
      const url = event.url;
      const parsedUrl = new URL(url);
      const category = url.split('?')[0].replace(Deeplinking.scheme + '/', '');
      const params = Object.fromEntries(parsedUrl.searchParams.entries());
      
      if (category === 'community') {
        if (params.roomType === HolepunchRoomType.GROUP) {
          navigation.dispatch(
            CommonActions.navigate(NavigationRoutes.CREATEGROUP, params),
          );
        } else if (params.roomType === HolepunchRoomType.DIRECT_MESSAGE) {
          console.log('[Home] DM deep link params:', params);
          navigation.dispatch(
            CommonActions.navigate(NavigationRoutes.COMMUNITY, params),
          );
        }
      }
    } catch (error) {
      console.log('Error parsing deep link:', error);
    }
  };


  useEffect(() => {
    const checkFirstAppImageBackup = async () => {
      if (!isFirstAppImageBackupCompleted) {
        const res = await ApiHandler.backupAppImage({all: true});
        setIsFirstAppImageBackupCompleted(res.status);
      }
    };
    setTimeout(() => {
      checkFirstAppImageBackup();
    }, 5000);
  }, []);
  

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.headerWrapper}>
        <HomeHeader showBalance={false} showScanner={true} />
      </View>
      {presetAssets.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          >
            <DefaultCoin presetAssets={presetAssets}/>
        </ScrollView>
      ) : (
        <CoinAssetsList
          listData={coins}
          loading={refreshing && !isBackupInProgress && !isBackupDone}
          onRefresh={handleRefresh}
          refreshingStatus={refreshing && !isBackupInProgress && !isBackupDone}
          onPressAddNew={() => {
            if (isNodeInitInProgress) {
              Toast(node.connectingNodeToastMsg, true);
              return;
            }
            handleNavigation(NavigationRoutes.ADDASSET, {
              issueAssetType: AssetType.Coin,
            });
          }}
          onPressAsset={() => handleNavigation(NavigationRoutes.COINDETAILS)}
        />
      )}
    </ScreenContainer>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 0,
      paddingTop: 0,
      flex:0
    },
    headerWrapper: {
      margin: hp(16),
    },
  });

export default HomeScreen;
