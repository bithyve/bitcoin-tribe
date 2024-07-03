import React, { useState, useContext } from 'react';
import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

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

const AssetsData = [
  {
    asset:
      'https://cdn.prod.www.spiegel.de/images/d2caafb1-70da-47e2-ba48-efd66565cde1_w1024_r0.9975262832405689_fpx44.98_fpy48.86.jpg',
    id: 1,
    title: 'The Demogorgan',
    details: 'Humanoid creature…',
    tag: 'COLLECTIBLE',
  },
  {
    asset:
      'https://artlogic-res.cloudinary.com/w_1000,c_limit,f_auto,fl_lossy,q_auto/ws-artlogicwebsite0889/usr/images/news/main_image/6/nft-bored-ape-yacht-club.png',
    id: 2,
    title: 'Vecna',
    details: 'Mastermid human ',
    tag: 'COLLECTIBLE',
  },
  {
    asset:
      'https://miro.medium.com/v2/resize:fit:1200/1*5AyYzOlGlv501PlJlIdZZQ.jpeg',
    id: 3,
    title: 'USD',
    details: 'The USD ',
    tag: 'COIN',
  },
  {
    asset:
      'https://cloudfront-us-east-2.images.arcpublishing.com/reuters/43YAWLITTZJLZIQTCP2JSS4KSM.jpg',
    id: 4,
    title: 'Third Item',
    details: 'Humanoid creature',
    tag: 'COLLECTIBLE',
  },
  {
    asset:
      'https://coingape.com/wp-content/uploads/2022/12/2_20230102_120403_0001.jpg',
    id: 5,
    title: 'Third Item',
    details: 'Humanoid creature…',
    tag: 'COIN',
  },
  {
    asset:
      'https://www.forbes.com/advisor/wp-content/uploads/2021/04/NFT.jpeg-900x510.jpg',
    id: 6,
    title: 'Third Item',
    details: 'Humanoid creature',
    tag: 'COIN',
  },
  {
    asset:
      'https://static01.nyt.com/images/2021/03/11/arts/11nft-explain-1/merlin_184196631_939fb22d-b909-4205-99d9-b464fb961d32-articleLarge.jpg?quality=75&auto=webp&disable=upscale',
    id: 7,
    title: 'Third Item',
    details: 'Humanoid creature…',
    tag: 'COIN',
  },
  {
    asset:
      'https://www.cnet.com/a/img/resize/7589227193923c006f9a7fd904b77bc898e105ff/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=768',
    id: 8,
    title: 'Third Item',
    details: 'Humanoid creature…',
    tag: 'COIN',
  },
  {
    id: 9,
    title: 'Add New',
  },
];

function HomeScreen() {
  const theme: AppTheme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { translations } = useContext(LocalizationContext);
  const { home, common, sendScreen } = translations;
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const handleScreenNavigation = (screenPath: string, params?) => {
    navigation.dispatch(CommonActions.navigate(screenPath, params));
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.headerWrapper}>
        <HomeHeader
          profile={
            'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x'
          }
          username="Dustin Henderson"
          balance="0.0134"
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
        AssetsData={AssetsData}
        onPressAddNew={() => setVisible(true)}
        onPressAsset={() =>
          handleScreenNavigation(NavigationRoutes.ASSETDETAILS)
        }
      />
      <ModalContainer
        title={home.addAssets}
        subTitle={home.addAssetSubTitle}
        visible={visible}
        onDismiss={() => setVisible(false)}>
        <AddAssetModal />
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
