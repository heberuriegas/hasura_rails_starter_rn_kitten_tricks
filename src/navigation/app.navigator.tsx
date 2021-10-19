import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import AuthNavigator from 'src/navigation/auth.navigator';
import { useAuth } from '../hooks/use-auth';
import { View } from 'react-native';
import { Text } from '@ui-kitten/components';

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

const Welcome = () => {
  const { currentUser } = useAuth();
  return (
    <View>
      <Text>Welcome {currentUser.username}!</Text>
    </View>
  );
};

export const AppNavigator = (): React.ReactElement => {
  const { isSignedIn } = useAuth();
  return (
    <NavigationContainer theme={navigatorTheme}>{isSignedIn ? <Welcome /> : <AuthNavigator />}</NavigationContainer>
  );
};
