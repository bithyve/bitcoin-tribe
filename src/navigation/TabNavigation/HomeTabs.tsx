import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../../screens/home/Home';
import Community from '../../screens/community/Community';
import Settings from '../../screens/settings/Settings';
import CustomTab from './CustomTab';

const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator tabBar={props => <CustomTab {...props} />}>
      <Tab.Screen
        name="Assets"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Community"
        component={Community}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
export default HomeTabs;