import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';

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
import HomeHeader from './components/HomeHeader';
import { hp } from 'src/constants/responsive';
import { RealmSchema } from 'src/storage/enum';
import useWallets from 'src/hooks/useWallets';
import { useWallet } from 'src/hooks/wallet/useWallet';
import { useBackup } from 'src/hooks/backup/useBackup';
import { useNode } from 'src/hooks/node/useNode';
import { useRgb } from 'src/hooks/rgb/useRgb';
import { useApp } from 'src/hooks/app/useApp';

import { AppContext } from 'src/contexts/AppContext';
import {
  Asset,
  WalletOnlineStatus,
} from 'src/models/interfaces/RGBWallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { VersionHistory } from 'src/models/interfaces/VersionHistory';
import AppType from 'src/models/enums/AppType';
import Toast from 'src/components/Toast';

import {
  NodeStatusType,
  PushNotificationType,
} from 'src/models/enums/Notifications';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, onMessage, onNotificationOpenedApp, getInitialNotification } from '@react-native-firebase/messaging';
import DefaultCoin from './DefaultCoin';
import { Keys, Storage } from 'src/storage';
import Deeplinking from 'src/utils/DeepLinking';
import { useMMKVBoolean } from 'react-native-mmkv';
import { AppUpdateModal } from './components/AppUpdateModal';
import { useAppVersion } from 'src/hooks/useAppVersion';
import { NativeModules } from 'react-native';

function HomeScreen() {
  /* const theme: AppTheme = useTheme(); */
  const prevStatusRef = useRef<string | null>(null);
  const styles = useMemo(() => getStyles(), []);

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
    isBackupDone,
    isBackupInProgress,
    setAppType,
    setNodeInitStatus,
    setNodeConnected,
    setIsWalletOnline,
    isWalletOnline,
    setWalletWentOnline
  } = useContext(AppContext);
  const presetAssets: Asset[] = JSON.parse(Storage.get(Keys.PRESET_ASSETS) as string || '[]');
  const [isFirstAppImageBackupCompleted, setIsFirstAppImageBackupCompleted] = useMMKVBoolean(Keys.FIRST_APP_IMAGE_BACKUP_COMPLETE)
  const [isTopicSubscribed, _] = useMMKVBoolean(Keys.IS_TOPIC_SUBSCRIBED);
  const { checkAndInitiateAndroidUpdate } = useAppVersion();

  const { checkVersion, manageFcmVersionTopics, syncFcmToken, makeWalletOnline, resetApp } = useApp();
  const { backup, isBackupRequired: isBackupRequiredMutation, backupAppImage } = useBackup();
  const { startNode, checkNodeStatus, saveNodeMnemonic } = useNode();
  const { viewUtxos, refreshRgbWallet: refreshRgbWalletBase, fetchPresetAssets } = useRgb();
  const { refreshWallets, getFeeAndExchangeRates } = useWallet();

  const { mutate: backupMutate, isLoading } = backup;
  const { mutate: checkBackupRequired, data: isBackupRequiredData } = isBackupRequiredMutation;
  const { mutate: startNodeMutate } = startNode;
  const { mutate: fetchUTXOs } = viewUtxos;
  const { mutate: refreshWalletsMutate } = refreshWallets;
  const [refreshing, setRefreshing] = useState(false);
  const wallet = useWallets({}).wallets[0];



  useEffect(() => {
    fetchPresetAssets.mutate();
  }, []);

  useEffect(() => {
    const initializeWalletOnline = async () => {
      if (isWalletOnline === WalletOnlineStatus.Online) return
      try {
        setIsWalletOnline(WalletOnlineStatus.InProgress);
        const response = await makeWalletOnline.mutateAsync(30);
        setWalletOnline(response.status);
        if (response.status)
          setWalletWentOnline(true);
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
        const status = await checkNodeStatus.mutateAsync({
          nodeId: app?.id,
          authToken: app?.authToken
        });
        const prevStatus = prevStatusRef.current;
        if (status === NodeStatusType.IN_PROGRESS) {
          setNodeInitStatus(true);
        } else if (status === NodeStatusType.PAUSED) {
          startNodeMutate({ nodeId: app?.id, authToken: app?.authToken });
        } else if (status === NodeStatusType.RUNNING) {
          await saveNodeMnemonic.mutateAsync({ nodeId: app?.id, authToken: app?.authToken });
          setNodeInitStatus(false);
          if (prevStatus === NodeStatusType.IN_PROGRESS) {
            setNodeConnected(true);
          }
        } else {
          await saveNodeMnemonic.mutateAsync({ nodeId: app?.id, authToken: app?.authToken });
          setNodeInitStatus(false);
        }
        console.log('Node status:', status);
      }
    };

    fetchStatus();
  }, []);

  const refreshRgbWallet = useMutation({
    mutationFn: refreshRgbWalletBase.mutateAsync,
    onSuccess: () => {
      if (app?.appType === AppType.ON_CHAIN) {
        checkBackupRequired();
      }
    },
  });

  useFocusEffect(
    useCallback(() => {
      const firebaseApp = getApp();
      const messaging = getMessaging(firebaseApp);

      const unsubscribe = onMessage(messaging, async remoteMessage => {
        // const { title, body } = remoteMessage.notification ?? {};
        const type = typeof remoteMessage.data?.type === 'string' ? remoteMessage.data.type : '';
        switch (type.toLowerCase()) {
          case PushNotificationType.NODE_INIT_COMPLETE:
            await saveNodeMnemonic.mutateAsync({ nodeId: app?.id, authToken: app?.authToken });
            setNodeInitStatus(false);
            setNodeConnected(true);
            break;
          case PushNotificationType.NODE_PAUSED:
            startNodeMutate({ nodeId: app?.id, authToken: app?.authToken });
            break;
          default:
            break;
        }
      });

      const notificationHandler = onNotificationOpenedApp(
        messaging,
        remoteMessage => {
          if (
            remoteMessage?.data?.type ===
            PushNotificationType.APP_UPDATE_AVAILABLE
          )
            if (Platform.OS === 'ios')
              NativeModules.AppStoreModule.openAppStore('6667112050');
            else checkAndInitiateAndroidUpdate();
        },
      );

      getInitialNotification(messaging).then(remoteMessage => {
        if (
          remoteMessage?.data?.type ===
          PushNotificationType.APP_UPDATE_AVAILABLE
        )
          if (Platform.OS === 'ios')
            NativeModules.AppStoreModule.openAppStore('6667112050');
          else checkAndInitiateAndroidUpdate();
      });

      return () => {
        unsubscribe();
        notificationHandler();
      };
    }, []),
  );

  useEffect(() => {
    setBackupProcess(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (isBackupRequiredData) {
      backupMutate();
    }
  }, [isBackupRequiredData]);

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
              resetApp.mutate(key);
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
    checkVersion.mutate();
    getFeeAndExchangeRates.mutate();
    syncFcmToken.mutate();
    if (walletOnline) {
      fetchUTXOs();
      refreshWalletsMutate({ wallets: [wallet] });
    }
  }, [app?.appType, walletOnline]);



  const handleRefresh = () => {
    if (isBackupInProgress || isBackupDone || !walletOnline) {
      return;
    }
    setRefreshing(true);
    fetchPresetAssets.mutate();
    refreshRgbWallet.mutate();
    checkBackupRequired();
    refreshWalletsMutate({ wallets: [wallet] });
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
        navigation.dispatch(
          CommonActions.navigate(NavigationRoutes.CREATEGROUP, params),
        );
      }
    } catch (error) {
      console.log('Error parsing deep link:', error);
    }
  };


  useEffect(() => {
    const checkFirstAppImageBackup = async () => {
      if (!isFirstAppImageBackupCompleted) {
        const res = await backupAppImage.mutateAsync({ all: true });
        setIsFirstAppImageBackupCompleted(res.status);
      }
    };
    setTimeout(() => {
      checkFirstAppImageBackup();
    }, 5000);
    // Topic subscription for app update notifications 
    if (!isTopicSubscribed) manageFcmVersionTopics.mutate();
  }, []);


  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.headerWrapper}>
        <HomeHeader showBalance={false} showScanner={true} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <DefaultCoin
          presetAssets={presetAssets}
          refreshingStatus={refreshing}
          onRefresh={handleRefresh}
        />
      </ScrollView>
      <AppUpdateModal />
    </ScreenContainer>
  );
}

const getStyles = () =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 0,
      paddingTop: 0,
      flex: 0
    },
    headerWrapper: {
      margin: hp(16),
    },
  });

export default HomeScreen;
