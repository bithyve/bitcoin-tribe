import React, { useContext, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useMutation } from 'react-query';
import LottieView from 'lottie-react-native';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ReceiveQrClipBoard from '../receive/components/ReceiveQrClipBoard';
import IconCopy from 'src/assets/images/icon_copy.svg';
import IconCopyLight from 'src/assets/images/icon_copy_light.svg';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import useRgbWallets from 'src/hooks/useRgbWallets';
import { Keys } from 'src/storage';
import AppText from 'src/components/AppText';
import CardBox from 'src/components/CardBox';
import NodeInfoFooter from './NodeInfoFooter';
import { AppTheme } from 'src/theme';
import SelectOption from 'src/components/SelectOption';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';

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
          <AppText variant="body2" style={styles.headerTitle}>
            {node.pubKey}
          </AppText>
          <ReceiveQrClipBoard
            qrCodeValue={nodeInfo.pubkey}
            icon={!isThemeDark ? <IconCopy /> : <IconCopyLight />}
          />

          <AppText variant="body2" style={styles.headerTitle}>
            {node.apiUrl}
          </AppText>
          <ReceiveQrClipBoard
            qrCodeValue={rgbWallet.nodeUrl}
            icon={!isThemeDark ? <IconCopy /> : <IconCopyLight />}
          />

          <View>
            <AppText variant="body2" style={styles.headerTitle}>
              {node.onchainPubkey}
            </AppText>
            <ReceiveQrClipBoard
              qrCodeValue={nodeInfo.onchain_pubkey}
              icon={!isThemeDark ? <IconCopy /> : <IconCopyLight />}
            />
          </View>

          {rgbWallet.peerDNS && (
            <View>
              <AppText variant="body2" style={styles.headerTitle}>
                Peer DNS
              </AppText>
              <ReceiveQrClipBoard
                qrCodeValue={rgbWallet.peerDNS}
                icon={!isThemeDark ? <IconCopy /> : <IconCopyLight />}
              />
            </View>
          )}

          <View>
            <AppText variant="body2" style={styles.headerTitle}>
              {node.rgbHtlcMinMsat}
            </AppText>
            <CardBox>
              <AppText variant="body1" style={styles.valueText}>
                {nodeInfo.rgb_htlc_min_msat}
              </AppText>
            </CardBox>
          </View>

          <View>
            <AppText variant="body1" style={styles.headerTitle}>
              {node.rgbChannelCapMinSat}
            </AppText>
            <CardBox>
              <AppText variant="body1" style={styles.valueText}>
                {nodeInfo.rgb_channel_capacity_min_sat}
              </AppText>
            </CardBox>
          </View>

          <View>
            <AppText variant="body1" style={styles.headerTitle}>
              {node.channelCapMisSat}
            </AppText>
            <CardBox>
              <AppText variant="body1" style={styles.valueText}>
                {nodeInfo.channel_capacity_min_sat}
              </AppText>
            </CardBox>
          </View>
          <View>
            <SelectOption
              title={'Unlock Node'}
              onPress={() => unlockNodeMutation.mutate()}
              enableSwitch={false}
              onValueChange={() => {}}
              toggleValue={nodeStatusLock}
            />
          </View>
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
  });
export default ViewNodeInfo;
