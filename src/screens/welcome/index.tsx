import React from 'react';
import { useAuth } from '../../hooks/use-auth';
import { View } from 'react-native';
import { Text, Button, Spinner } from '@ui-kitten/components';

const Welcome = () => {
  const { currentUser, signOut, isLoading } = useAuth();
  return (
    <View>
      <Text>Welcome {currentUser?.username}!</Text>
      <Button disabled={isLoading} accessoryLeft={isLoading && (() => <Spinner />)} onPress={signOut}>
        Cerrar sesión
      </Button>
    </View>
  );
};

export default Welcome;
