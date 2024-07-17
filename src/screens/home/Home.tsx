import React, { useState, useContext, useEffect } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import ModalContainer from 'src/components/ModalContainer';
import ScreenContainer from 'src/components/ScreenContainer';
import { LocalizationContext } from 'src/contexts/LocalizationContext';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AddAssetModal from './components/AddAssetModal';
import AssetsList from './components/AssetsList';
import HomeHeader from './components/HomeHeader';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { AppTheme } from 'src/theme';
import { hp } from 'src/constants/responsive';
import { RealmSchema } from 'src/storage/enum';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { useQuery } from '@realm/react';
import useWallets from 'src/hooks/useWallets';
import { useMutation } from 'react-query';
import { ApiHandler } from 'src/services/handler/apiHandler';
import { Coin } from 'src/models/interfaces/RGBWallet';
import { VersionHistory } from 'src/models/interfaces/VersionHistory';

function HomeScreen() {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { home, common, sendScreen } = translations;
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const { version }: VersionHistory = useQuery(RealmSchema.VersionHistory)[0];
  const [visible, setVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [walletName, setWalletName] = useState(null);
  const navigation = useNavigation();
  const refreshRgbWallet = useMutation(ApiHandler.refreshRgbWallet);

  const wallet: Wallet = useWallets({}).wallets[0];
  const coins = useQuery<Coin[]>(RealmSchema.Coin);

  useEffect(() => {
    refreshRgbWallet.mutate();
    if (
      version !== `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`
    ) {
      ApiHandler.checkVersion(
        version,
        `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
      );
    }
  }, []);

  useEffect(() => {
    if ((app && app.walletImage) || app.appName) {
      const base64Image = app.walletImage;
      setImage(base64Image);
      setWalletName(app.appName);
    }
  }, [app]);

  const handleScreenNavigation = (screenPath: string, params?) => {
    navigation.dispatch(CommonActions.navigate(screenPath, params));
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.headerWrapper}>
        <HomeHeader
          profile={image}
          username={walletName}
          balance={`${
            wallet.specs.balances.confirmed + wallet.specs.balances.unconfirmed
          }`}
          onPressScanner={() =>
            handleScreenNavigation(NavigationRoutes.SENDSCREEN, {
              receiveData: 'send',
              title: common.send,
              subTitle: sendScreen.headerSubTitle,
            })
          }
          onPressNotification={() => console.log('notification')}
          onPressProfile={() =>
            handleScreenNavigation(NavigationRoutes.WALLETDETAILS)
          }
        />
      </View>
      <AssetsList
        listData={coins}
        onPressAddNew={() => setVisible(true)}
        onPressAsset={(asset: Coin) =>
          handleScreenNavigation(NavigationRoutes.COINDETAILS, {
            assetId: asset.assetId,
          })
        }
      />
      <ModalContainer
        title={home.addAssets}
        subTitle={home.addAssetSubTitle}
        visible={visible}
        onDismiss={() => setVisible(false)}>
        <AddAssetModal onDismiss={() => setVisible(false)} />
      </ModalContainer>
    </ScreenContainer>
  );
}
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 0,
      paddingTop: 0,
    },
    headerWrapper: {
      margin: hp(25),
    },
  });
export default HomeScreen;
