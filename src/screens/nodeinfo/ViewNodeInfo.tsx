import React, { useContext, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useMutation } from 'react-query';
import LottieView from 'lottie-react-native';

import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import useRgbWallets from 'src/hooks/useRgbWallets';
import { Keys } from 'src/storage';
import NodeInfoFooter from './NodeInfoFooter';
import { AppTheme } from 'src/theme';
import SelectOption from 'src/components/SelectOption';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import NodeInfoItem from './components/NodeInfoItem';
import { hp } from 'src/constants/responsive';

const ViewNodeInfo = () => {
  const { translations } = useContext(LocalizationContext);
  const { node } = translations;
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { mutate, isLoading, error, data } = useMutation(
    ApiHandler.viewNodeInfo,
  );
  const syncMutation = useMutation(ApiHandler.syncNode);
  const initNodeMutation = useMutation(ApiHandler.initNode);
  const unlockNodeMutation = useMutation(ApiHandler.unlockNode);
  const [nodeStatus, setSetNodeStatus] = useState('run');
  const [nodeStatusLock, setSetNodeStatusLock] = useState(false);
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];
  const [nodeInfo, setnodeInfo] = useState({});

  useEffect(() => {
    mutate();
  }, []);

  useEffect(() => {
    if (syncMutation.isSuccess) {
      Toast('Node synced', false);
      syncMutation.reset();
    } else if (syncMutation.isError) {
      Toast(`${syncMutation.error}`, true);
    }
  }, [syncMutation.isSuccess, syncMutation, syncMutation.isError]);

  useEffect(() => {
    if (initNodeMutation.isSuccess) {
      Toast('Node initiated', false);
      initNodeMutation.reset();
      mutate();
    } else if (initNodeMutation.isError) {
      Toast(`${initNodeMutation.error}`, true);
    }
  }, [initNodeMutation.isSuccess, initNodeMutation, initNodeMutation.isError]);

  useEffect(() => {
    if (unlockNodeMutation.isSuccess) {
      Toast('Node unlocked', false);
      unlockNodeMutation.reset();
    } else if (unlockNodeMutation.isError) {
      Toast(`${unlockNodeMutation.error}`, true);
    }
  }, [
    unlockNodeMutation.isSuccess,
    unlockNodeMutation,
    unlockNodeMutation.isError,
  ]);

  useEffect(() => {
    if (data) {
      setnodeInfo(data);
    } else if (error) {
      Toast(error, false);
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
        visible={
          syncMutation.isLoading ||
          initNodeMutation.isLoading ||
          unlockNodeMutation.isLoading
        }
      />
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <LottieView
            source={require('src/assets/images/loader.json')}
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
            <SelectOption
              title={node.unlockNode}
              onPress={() => unlockNodeMutation.mutate()}
              enableSwitch={false}
              onValueChange={() => {}}
              toggleValue={nodeStatusLock}
            />
          </View>
          <NodeInfoItem
            title={node.pubKey}
            value={nodeInfo.pubkey}
            isCopiable={true}
            copyMessage={node.pubKeyCopyMsg}
          />

          <NodeInfoItem
            title={node.apiUrl}
            value={rgbWallet.nodeUrl}
            isCopiable={true}
            copyMessage={node.nodeUrlCopyMsg}
          />

          <NodeInfoItem
            title={node.onchainPubkey}
            value={nodeInfo.onchain_pubkey}
            isCopiable={true}
            copyMessage={node.onChainPubKeyCopyMsg}
          />

          {rgbWallet.peerDNS && (
            <NodeInfoItem
              title={node.peerDns}
              value={`${nodeInfo.pubkey}@${rgbWallet.peerDNS}`}
              isCopiable={true}
              copyMessage={() => 'Peer URL copied'}
            />
          )}

          <NodeInfoItem
            title={node.rgbHtlcMinMsat}
            value={nodeInfo.rgb_htlc_min_msat}
          />
          <NodeInfoItem
            title={node.rgbChannelCapMinSat}
            value={nodeInfo.rgb_channel_capacity_min_sat}
          />

          <NodeInfoItem
            title={node.channelCapMisSat}
            value={nodeInfo.channel_capacity_min_sat}
          />

          {/* <View>
            <SelectOption
              title={node.initNode}
              onPress={() => initNodeMutation.mutate()}
              enableSwitch={false}
              showArrow={false}
            />
          </View> */}
        </ScrollView>
      )}
      {!isLoading && (
        <NodeInfoFooter
          nodeStatus={nodeStatus}
          setNodeStatus={text => setSetNodeStatus(text)}
          onPressRefresh={() => syncMutation.mutate()}
        />
      )}
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
  });
export default ViewNodeInfo;
