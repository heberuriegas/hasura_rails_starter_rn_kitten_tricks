import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpByEmailScreen from 'src/screens/auth/email/sign-up';
import SignInByEmailScreen from 'src/screens/auth/email/sign-in';
import ForgotPasswordScreen from 'src/screens/auth/email/forgot-password';
import SignUpByPhoneNumberScreen from 'src/screens/auth/phone-number/sign-up';
import SignInByPhoneNumberScreen from 'src/screens/auth/phone-number/sign-in';
import useOAuth2 from 'src/hooks/use-oauth2';

const Stack = createStackNavigator();

export const AuthEmailNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignUp" component={SignUpByEmailScreen} options={{ headerShown: false }}></Stack.Screen>
      <Stack.Screen name="SignIn" component={SignInByEmailScreen} options={{ headerShown: false }}></Stack.Screen>
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      ></Stack.Screen>
    </Stack.Navigator>
  );
};

export const AuthPhoneNumberNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignUp" component={SignUpByPhoneNumberScreen} options={{ headerShown: false }}></Stack.Screen>
      <Stack.Screen name="SignIn" component={SignInByPhoneNumberScreen} options={{ headerShown: false }}></Stack.Screen>
    </Stack.Navigator>
  );
};

export const AuthOAuth2Navigator = () => {
  const { oauth2SignIn } = useOAuth2();
  useEffect(oauth2SignIn, []);
  return <></>;
};
