import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { AuthEmailNavigator } from 'src/navigation/auth.navigator';
import Loading from '../components/loading.component';
import { useAuth } from '../hooks/use-auth';
import AppContent from '../screens/app-content';

/*
 * Navigation theming: https://reactnavigation.org/docs/en/next/themes.html
 */
const navigatorTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // prevent layout blinking when performing navigation
    background: 'transparent',
  },
};

export const AppNavigator = (): React.ReactElement => {
  const { isSignedIn, userLoading } = useAuth();
  return (
    <NavigationContainer theme={navigatorTheme}>
      {userLoading ? <Loading /> : isSignedIn ? <AppContent /> : <AuthEmailNavigator />}
    </NavigationContainer>
  );
};
