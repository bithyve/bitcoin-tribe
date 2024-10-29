import React, { useContext, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import ScreenContainer from 'src/components/ScreenContainer';
import FooterNote from 'src/components/FooterNote';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import ShowQRCode from 'src/components/ShowQRCode';
import ReceiveQrClipBoard from '../receive/components/ReceiveQrClipBoard';
import IconCopy from 'src/assets/images/icon_copy.svg';
import IconCopyLight from 'src/assets/images/icon_copy_light.svg';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { useMutation } from 'react-query';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import useRgbWallets from 'src/hooks/useRgbWallets';
import { useNavigation, useRoute } from '@react-navigation/native';
import CreateUtxosModal from 'src/components/CreateUtxosModal';
import ModalLoading from 'src/components/ModalLoading';
import Toast from 'src/components/Toast';
import { useMMKVBoolean } from 'react-native-mmkv';
import { Keys } from 'src/storage';
import LottieView from 'lottie-react-native';
import AppText from 'src/components/AppText';
import CardBox from 'src/components/CardBox';

const styles = StyleSheet.create({
  refreshLoader: {
    alignSelf: 'center',
    width: 100,
    height: 100,
  },
});

const ViewNodeInfo = () => {
  const { translations } = useContext(LocalizationContext);
  const {
    receciveScreen,
    common,
    assets,
    wallet: walletTranslation,
  } = translations;
  const navigation = useNavigation();
  const [isThemeDark] = useMMKVBoolean(Keys.THEME_MODE);
  const { mutate, isLoading, error, data } = useMutation(
    ApiHandler.viewNodeInfo,
  );
  const [showErrorModal, setShowErrorModal] = useState(false);
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
        <ScrollView>
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
    </ScreenContainer>
  );
};

export default ViewNodeInfo;
