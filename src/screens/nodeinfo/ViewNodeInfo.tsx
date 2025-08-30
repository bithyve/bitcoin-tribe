import React, { useContext, useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useMutation } from 'react-query';
import LottieView from 'lottie-react-native';
import { useQuery } from '@realm/react';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import useRgbWallets from 'src/hooks/useRgbWallets';
import { Keys } from 'src/storage';
import NodeInfoFooter from './NodeInfoFooter';
import { AppTheme } from 'src/theme';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import NodeInfoItem from './components/NodeInfoItem';
import { hp, windowHeight } from 'src/constants/responsive';
import { AppContext } from 'src/contexts/AppContext';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import GradientView from 'src/components/GradientView';
import Colors from 'src/theme/Colors';
import AppText from 'src/components/AppText';
import Capitalize from 'src/utils/capitalizeUtils';
import { NodeStatusType } from 'src/models/enums/Notifications';
import PrimaryCTA from 'src/components/PrimaryCTA';
import openLink from 'src/utils/OpenLink';
import NodeAccessButton from './components/NodeAccessButton';

const ViewNodeInfo = () => {
  const { translations } = useContext(LocalizationContext);
  const { node, channel: channelTranslations } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const app = useQuery<TribeApp>(RealmSchema.TribeApp)[0];
  const { mutate, isLoading, isError, error, data } = useMutation(
    ApiHandler.viewNodeInfo,
  );
  const { mutate: checkStatus, isLoading: nodeStatusIsLoading } = useMutation(
    () => ApiHandler.startNode(app?.id, app?.authToken),
  );
  const { setIsWalletOnline } = useContext(AppContext);
  const syncMutation = useMutation(ApiHandler.syncNode);
  const unlockNodeMutation = useMutation(ApiHandler.unlockNode);
  const [nodeStatus, setSetNodeStatus] = useState('');
  const [nodeStatusLock, setSetNodeStatusLock] = useState(false);
  const [isNodeStatusLoading, setIsNodeStatusLoading] = useState(false);
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];
  const [nodeInfo, setnodeInfo] = useState({});
  const statusColors = {
    In_progress: Colors.SelectiveYellow,
    Running: Colors.GOGreen,
    Starting: Colors.BrandeisBlue,
    Paused: Colors.ChineseWhite,
    Destroyed: Colors.FireOpal,
  };

  const getStatusColor = status => statusColors[status] || Colors.FireOpal;
  useEffect(() => {
    mutate();
    const fetchStatus = async () => {
      if (
        app.appType === AppType.SUPPORTED_RLN ||
        app.appType === AppType.NODE_CONNECT
      ) {
        try {
          setIsNodeStatusLoading(true);
          const status = await ApiHandler.checkNodeStatus(
            app?.id,
            app?.authToken,
          );
          const formattedStatus = status && Capitalize(status);
          setSetNodeStatus(formattedStatus);
        } catch (error) {
          console.log('Failed to fetch node status:', error);
          setSetNodeStatus('');
          setIsNodeStatusLoading(false);
        } finally {
          setIsNodeStatusLoading(false);
        }
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    if (data?.error) {
      const errorMsg = data?.message || data?.error || 'Something went wrong';
      Toast(errorMsg, true);
    }
  }, [data]);

  useEffect(() => {
    if (syncMutation.isSuccess) {
      Toast('Node synced', false);
      syncMutation.reset();
    } else if (syncMutation.isError) {
      const error = syncMutation.error;
      let message = 'Failed to sync the node. Please try again later.';

      if (error?.response?.data?.error) {
        message = error.response.data.error;
      } else if (
        error?.message &&
        error.message !== 'Error' &&
        !error.message.includes('Cannot read property')
      ) {
        message = error.message;
      }

      console.log('syncMutation.error', error);
      Toast(message, true);
    }
  }, [syncMutation.isSuccess, syncMutation, syncMutation.isError]);

  useEffect(() => {
    if (unlockNodeMutation.isSuccess) {
      setIsWalletOnline(true);
      Toast('Node unlocked', false);
      unlockNodeMutation.reset();
    } else if (unlockNodeMutation.isError) {
      const error = unlockNodeMutation.error;
      let message = 'Failed to unlock the node. Please try again later.';
      if (error?.response?.data?.error) {
        message = error.response.data.error;
      } else if (
        error?.message &&
        error.message !== 'Error' &&
        !error.message.includes('Cannot read property')
      ) {
        message = error.message;
      }
      Toast(message, true);
    }
  }, [
    unlockNodeMutation.isSuccess,
    unlockNodeMutation,
    unlockNodeMutation.isError,
  ]);

  useEffect(() => {
    if (data) {
      if (data?.message === 'Internal server error') {
        Toast(
          'Unable to fetch node info due to a server error. Please try again later.',
          true,
        );
      } else {
        setnodeInfo(data);
      }
    } else if (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      Toast(errMsg, true);
    }
  }, [data, error]);

  return (
    <ScreenContainer>
      <AppHeader
        title={node.viewNodeInfoTitle}
        subTitle={''}
        enableBack={true}
      />
      <ModalLoading
        visible={syncMutation.isLoading || unlockNodeMutation.isLoading}
      />
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <LottieView
            source={require('src/assets/images/jsons/loader.json')}
            autoPlay
            loop
            style={styles.refreshLoader}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollingWrapper}>
          <View style={styles.unLockWrapper}>
            <View style={styles.nodeStatusWrapper}>
              <GradientView
                style={[styles.container]}
                colors={[
                  theme.colors.cardGradient1,
                  theme.colors.cardGradient2,
                  theme.colors.cardGradient3,
                ]}>
                <AppText variant="body1" style={styles.titleText}>
                  {channelTranslations.status}
                </AppText>
                {isNodeStatusLoading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <AppText
                    variant="body1"
                    style={{ color: getStatusColor(nodeStatus) }}>
                    {nodeStatus || 'Node Not Found'}
                  </AppText>
                )}
              </GradientView>
              {nodeStatus?.toUpperCase() !== NodeStatusType.DESTROYED &&
                nodeStatus !== undefined && (
                  <NodeAccessButton
                    locked={!nodeInfo?.pubkey}
                    onPress={() => unlockNodeMutation.mutate()}
                  />
                )}
            </View>

            {/* {nodeStatus?.toUpperCase() !== NodeStatusType.DESTROYED &&
              nodeStatus !== undefined && (
                <SelectOption
                  title={node.unlockNode}
                  onPress={() => unlockNodeMutation.mutate()}
                  enableSwitch={false}
                  onValueChange={() => {}}
                  toggleValue={nodeStatusLock}
                />
              )} */}
          </View>
          <NodeInfoItem
            title={node.nodeIdtitle}
            value={app?.id}
            copyMessage={node.nodeIdCopyMsg}
          />
          {nodeInfo?.pubkey && (
            <NodeInfoItem
              title={node.pubKey}
              value={nodeInfo?.pubkey}
              copyMessage={node.pubKeyCopyMsg}
            />
          )}

          <NodeInfoItem
            title={node.apiUrl}
            value={rgbWallet?.nodeUrl}
            copyMessage={node.nodeUrlCopyMsg}
          />

          {app.appType === AppType.NODE_CONNECT && (
            <NodeInfoItem
              title={node.onchainPubkey}
              value={nodeInfo?.onchain_pubkey}
              copyMessage={node.onChainPubKeyCopyMsg}
            />
          )}

          {nodeInfo?.pubkey && rgbWallet?.peerDNS && (
            <NodeInfoItem
              title={node.peerUrl}
              value={`${nodeInfo?.pubkey}@${rgbWallet?.peerDNS}`}
              isCopiable={true}
              copyMessage={'Peer URL copied'}
            />
          )}

          {nodeInfo?.rgb_htlc_min_msat && (
            <NodeInfoItem
              title={node.rgbHtlcMinMsat}
              value={nodeInfo?.rgb_htlc_min_msat}
            />
          )}
          {nodeInfo?.rgb_channel_capacity_min_sat && (
            <NodeInfoItem
              title={node.rgbChannelCapMinSat}
              value={nodeInfo?.rgb_channel_capacity_min_sat}
            />
          )}
          {nodeInfo?.channel_capacity_min_sat && (
            <NodeInfoItem
              title={node.channelCapMisSat}
              value={nodeInfo?.channel_capacity_min_sat}
            />
          )}
        </ScrollView>
      )}
      {!isLoading &&
        nodeStatus?.toUpperCase() !== NodeStatusType.DESTROYED &&
        nodeStatus !== undefined && (
          <NodeInfoFooter
            nodeStatus={nodeStatus}
            onPressNodeRun={() => checkStatus()}
            onPressRefresh={() => syncMutation.mutate()}
          />
        )}
      {nodeStatus?.toUpperCase() === NodeStatusType.DESTROYED ||
        (nodeStatus === undefined && (
          <View style={styles.nodenotFoundWrapper}>
            <View style={styles.contentWrapper}>
              <AppText variant="heading2" style={styles.nodenotFoundHeaderText}>
                {node.nodeNotFoundTitle}
              </AppText>
              <AppText variant="body1" style={styles.nodenotFoundSubText}>
                {node.nodeNotFoundSubTitle}
              </AppText>
            </View>
            <PrimaryCTA
              title={node.telegramSupport}
              onPress={() => openLink('https://t.me/BitcoinTribeSupport')}
              width={hp(200)}
            />
          </View>
        ))}
    </ScreenContainer>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scrollingWrapper: {
      height: '70%',
    },
    loadingWrapper: {
      height: '76%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    refreshLoader: {
      alignSelf: 'center',
      width: 100,
      height: 100,
    },
    headerTitle: {
      color: theme.colors.secondaryHeadingColor,
    },
    valueText: {
      color: theme.colors.headingColor,
    },
    unLockWrapper: {
      marginVertical: hp(20),
    },
    nodeStatusWrapper: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    container: {
      width: '68%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: windowHeight > 670 ? hp(20) : hp(10),
      paddingVertical: windowHeight > 670 ? hp(15) : hp(5),
      borderRadius: 15,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      marginVertical: hp(5),
    },
    nodenotFoundWrapper: {
      backgroundColor: theme.colors.inputBackground,
      padding: hp(16),
      borderRadius: hp(16),
    },
    nodenotFoundHeaderText: {
      color: theme.colors.headingColor,
    },
    nodenotFoundSubText: {
      color: theme.colors.headingColor,
    },
    contentWrapper: {
      marginBottom: hp(20),
    },
  });
export default ViewNodeInfo;
