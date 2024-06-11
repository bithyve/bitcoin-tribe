import * as React from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import AssetsList from './components/AssetsList';
import HomeHeader from './components/HomeHeader';

const AssetsData = [
  {
    asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4',
    id: 1,
    title: 'The Demogorgan',
    details: 'Humanoid creature… with head shaped like a flower',
  },
  {
    asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4',
    id: 2,
    title: 'Vecna',
    details: 'Mastermid human ',
  },
  {
    asset: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4',
    id: 3,
    title: 'USD',
    details: 'The USD (United States dollar) ',
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
    details: 'Humanoid creature… with head a flower',
  },
  {
    id: 7,
    title: 'Add New',
  },
];

function HomeScreen() {
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
      />
      <AssetsList AssetsData={AssetsData} />
    </ScreenContainer>
  );
}
export default HomeScreen;
