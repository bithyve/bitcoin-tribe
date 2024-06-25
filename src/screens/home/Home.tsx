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
    asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4',
    id: 1,
    title: 'The Demogorgan',
    details: 'Humanoid creature…',
    tag: 'COLLECTIBLES',
  },
  {
    asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4',
    id: 2,
    title: 'Vecna',
    details: 'Mastermid human ',
    tag: 'COLLECTIBLES',
  },
  {
    asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4',
    id: 3,
    title: 'USD',
    details: 'The USD ',
    tag: 'COIN',
  },
  {
    asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4',
    id: 4,
    title: 'Third Item',
    details: 'Humanoid creature',
    tag: 'COLLECTIBLES',
  },
  {
    asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4',
    id: 5,
    title: 'Third Item',
    details: 'Humanoid creature…',
    tag: 'COIN',
  },
  {
    asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=78',
    id: 6,
    title: 'Third Item',
    details: 'Humanoid creature',
    tag: 'COIN',
  },
  {
    asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=78',
    id: 7,
    title: 'Third Item',
    details: 'Humanoid creature…',
    tag: 'COIN',
  },
  {
    asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=78',
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
  const { home } = translations;
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const handleScreenNavigation = (screenPath: string) => {
    navigation.dispatch(CommonActions.navigate(screenPath));
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
            handleScreenNavigation(NavigationRoutes.SENDSCREEN)
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
