import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import ViewUnspentScreen from 'src/screens/collectiblesCoins/ViewUnspentScreen';

const renderScene = SceneMap({
  colored: ViewUnspentScreen,
  colorable: ViewUnspentScreen,
});

const routes = [
  { key: 'colored', title: 'Colored' },
  { key: 'colorable', title: 'Colorable' },
];

export default function UTXOTabs() {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
}