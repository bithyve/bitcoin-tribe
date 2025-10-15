import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Community from 'src/screens/community/CommunityNew';
import HomeScreen from 'src/screens/home/Home';
import Settings from 'src/screens/settings/Settings';
import { NavigationRoutes } from '../NavigationRoutes';
import CustomTab from './CustomTab';
import AssetsTabs from './AssetsTabs';

const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator tabBar={props => <CustomTab {...props} />}>
      <Tab.Screen
        name={NavigationRoutes.HOMESCREEN}
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={NavigationRoutes.ASSETS}
        component={AssetsTabs}
        options={{
          headerShown: false,
        }}
      />
        <Tab.Screen
          name={NavigationRoutes.COMMUNITY}
          component={Community}
          options={{
            headerShown: false,
          }}
        />
      <Tab.Screen
        name={NavigationRoutes.SETTINGS}
        component={Settings}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
export default HomeTabs;
