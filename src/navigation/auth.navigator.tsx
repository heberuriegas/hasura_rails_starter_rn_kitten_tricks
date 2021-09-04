import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpScreen from 'src/screens/auth/sign-up';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignUp" component={SignUpScreen}></Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthNavigator;
