import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Community from 'src/screens/community/Community';
import HomeScreen from 'src/screens/home/Home';
import Settings from 'src/screens/settings/Settings';
import Collectibles from 'src/screens/home/Collectibles';
import { NavigationRoutes } from '../NavigationRoutes';
import CustomTab from './CustomTab';

const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator tabBar={props => <CustomTab {...props} />}>
      <Tab.Screen
        name={NavigationRoutes.ASSETS}
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={NavigationRoutes.COLLECTIBLE}
        component={Collectibles}
        options={{
          headerShown: false,
        }}
      />
        {/* <Tab.Screen
          name={NavigationRoutes.COMMUNITY}
          component={Community}
          options={{
            headerShown: false,
          }}
        /> */}
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
