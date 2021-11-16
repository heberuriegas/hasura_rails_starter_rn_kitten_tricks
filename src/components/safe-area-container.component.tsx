import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Divider, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { SafeAreaLayout } from './safe-area-layout.component';
import { MenuIcon, ArrowIosBackIcon, BackIcon } from './icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ParamListBase } from '@react-navigation/routers';
import { useNavigationState } from '@react-navigation/core';

interface SafeAreaContainerProps {
  navigation: DrawerNavigationProp<ParamListBase>;
  title?: string;
  cancelBack?: boolean;
}

export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({ navigation, title, cancelBack, children }) => {
  const routeName = useNavigationState(_state => _state.routeNames[_state.index]);

  const renderDrawerAction = (): React.ReactElement =>
    navigation.canGoBack() && !cancelBack ? (
      <TopNavigationAction icon={Platform.OS === 'ios' ? ArrowIosBackIcon : BackIcon} onPress={navigation.goBack} />
    ) : (
      <TopNavigationAction icon={MenuIcon} onPress={navigation.toggleDrawer} />
    );

  return (
    <SafeAreaLayout style={styles.safeArea} insets="top">
      <TopNavigation title={title || routeName} accessoryLeft={renderDrawerAction} />
      <Divider />
      {children}
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default SafeAreaContainer;
