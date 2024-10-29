import React, { useContext, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMMKVBoolean } from 'react-native-mmkv';
import { useMutation } from 'react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
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

const ViewNodeInfo = () => {
  const { translations } = useContext(LocalizationContext);
  const {
    receciveScreen,
    common,
    assets,
    wallet: walletTranslation,
  } = translations;
  const navigation = useNavigation();
  const theme: AppTheme = useTheme();
  const styles = getStyles(theme);
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { mutate, isLoading, error, data } = useMutation(
    ApiHandler.viewNodeInfo,
  );
  const [nodeStatus, setSetNodeStatus] = useState('run');
  const rgbWallet: RGBWallet = useRgbWallets({}).wallets[0];
  const [nodeInfo, setnodeInfo] = useState({});

  useEffect(() => {
    mutate();
  }, []);

  useEffect(() => {
    if (data) {
      setnodeInfo(data);
    } else if (error) {
      navigation.goBack();
    }
  }, [data, error]);

  return (
    <ScreenContainer>
      <AppHeader title={'View Node Info'} subTitle={''} enableBack={true} />
      {isLoading ? (
        <LottieView
          source={require('src/assets/images/loader.json')}
          autoPlay
          loop
          style={styles.refreshLoader}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={'false'}
          style={styles.scrollingWrapper}>
          <AppText variant="heading3" style={styles.headerTitle}>
            Pubkey:
          </AppText>
          <ReceiveQrClipBoard
            qrCodeValue={nodeInfo.pubkey}
            icon={!isThemeDark ? <IconCopy /> : <IconCopyLight />}
          />

          <AppText variant="heading3" style={styles.headerTitle}>
            API URL:
          </AppText>
          <ReceiveQrClipBoard
            qrCodeValue={rgbWallet.nodeUrl}
            icon={!isThemeDark ? <IconCopy /> : <IconCopyLight />}
          />

          <View>
            <AppText variant="heading3" style={styles.headerTitle}>
              Onchain Pubkey:
            </AppText>
            <ReceiveQrClipBoard
              qrCodeValue={nodeInfo.onchain_pubkey}
              icon={!isThemeDark ? <IconCopy /> : <IconCopyLight />}
            />
          </View>

          <View>
            <AppText variant="heading3" style={styles.headerTitle}>
              Rgb_htlc_min_msat:
            </AppText>
            <CardBox>
              <AppText variant="body1" style={styles.headerTitle}>
                {nodeInfo.rgb_htlc_min_msat}
              </AppText>
            </CardBox>
          </View>

          <View>
            <AppText variant="heading3" style={styles.headerTitle}>
              Rgb_channel_capacity_min_sat:
            </AppText>
            <CardBox>
              <AppText variant="body1" style={styles.headerTitle}>
                {nodeInfo.rgb_channel_capacity_min_sat}
              </AppText>
            </CardBox>
          </View>

          <View>
            <AppText variant="heading3" style={styles.headerTitle}>
              Channel_capacity_min_sat:
            </AppText>
            <CardBox>
              <AppText variant="body1" style={styles.headerTitle}>
                {nodeInfo.channel_capacity_min_sat}
              </AppText>
            </CardBox>
          </View>
        </ScrollView>
      )}
      <NodeInfoFooter
        nodeStatus={nodeStatus}
        setNodeStatus={text => setSetNodeStatus(text)}
      />
    </ScreenContainer>
  );
};
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scrollingWrapper: {
      height: '70%',
    },
    refreshLoader: {
      alignSelf: 'center',
      width: 100,
      height: 100,
    },
  });
export default ViewNodeInfo;
