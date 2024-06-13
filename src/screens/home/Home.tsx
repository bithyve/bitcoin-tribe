import React, { useState } from 'react';
import ModalContainer from 'src/components/ModalContainer';
import ScreenContainer from 'src/components/ScreenContainer';
import { NavigationRoutes } from 'src/navigation/NavigationRoutes';
import AddAssetModal from './components/AddAssetModal';
import AssetsList from './components/AssetsList';
import HomeHeader from './components/HomeHeader';

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
  // {
  //   asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4',
  //   id: 4,
  //   title: 'Third Item',
  //   details: 'Humanoid creature… with head a flower',
  // },
  // {
  //   asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4',
  //   id: 5,
  //   title: 'Third Item',
  //   details: 'Humanoid creature… with head a flower',
  // },
  {
    asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=78',
    id: '6',
    title: 'Third Item',
    details: 'Humanoid creature…',
    tag: 'COIN',
  },
  {
    id: 7,
    title: 'Add New',
  },
];

function HomeScreen({ navigation }) {
  const [visible, setVisible] = useState(false);
  return (
    <ScreenContainer>
      <HomeHeader
        profile={
          'https://gravatar.com/avatar/a7ef0d47358b93336c4451de121be367?s=400&d=robohash&r=x'
        }
        username="Dustin Henderson"
        balance="0.0134"
        onPressScanner={() => console.log('scanner')}
        onPressNotification={() => console.log('notification')}
        onPressProfile={() =>
          navigation.navigate(NavigationRoutes.WALLETDETAILS)
        }
      />
      <AssetsList
        AssetsData={AssetsData}
        onPressAddNew={() => setVisible(true)}
        onPressAsset={() => navigation.navigate(NavigationRoutes.ASSETDETAILS)}
      />
      <ModalContainer
        title="Add Assets"
        subTitle="Lorem ipsum dolor sit amet, consec tetur"
        visible={visible}
        onDismiss={() => setVisible(false)}>
        <AddAssetModal />
      </ModalContainer>
    </ScreenContainer>
  );
}
export default HomeScreen;
