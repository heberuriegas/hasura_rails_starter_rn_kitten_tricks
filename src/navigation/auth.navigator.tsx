import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpScreen from 'src/screens/auth/email/sign-up';
import SignInScreen from 'src/screens/auth/email/sign-in';
import ForgotPasswordScreen from 'src/screens/auth/email/forgot-password';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }}></Stack.Screen>
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }}></Stack.Screen>
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      ></Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthNavigator;
