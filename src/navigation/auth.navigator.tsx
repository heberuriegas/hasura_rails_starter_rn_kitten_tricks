import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpScreen from 'src/screens/auth/sign-up-4';
import SignInScreen from 'src/screens/auth/sign-in-4';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignUp4" component={SignUpScreen} options={{ headerShown: false }}></Stack.Screen>
      <Stack.Screen name="SignIn4" component={SignInScreen} options={{ headerShown: false }}></Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthNavigator;
