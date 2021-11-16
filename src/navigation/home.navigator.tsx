import React from 'react';
import { LogBox } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HomeDrawer } from '../scenes/home/home-drawer.component';
import Welcome from 'src/screens/welcome';
import ProfileSetting from '../screens/profile-settings/index';

const Drawer = createDrawerNavigator();

export const HomeNavigator = (): React.ReactElement => (
  <Drawer.Navigator screenOptions={{ gestureEnabled: true }} drawerContent={props => <HomeDrawer {...props} />}>
    <Drawer.Screen name="Welcome" component={Welcome} />
    <Drawer.Screen name="Profile Setting" component={ProfileSetting} />
  </Drawer.Navigator>
);

LogBox.ignoreLogs(['Accessing the state']);
