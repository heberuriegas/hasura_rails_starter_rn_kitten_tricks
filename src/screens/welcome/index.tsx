import React, { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Spinner } from '@ui-kitten/components';

const Welcome = () => {
  const [isLoading, setIsLoading] = useState<boolean>();

  const { currentUser, signOut } = useAuth();

  const onPressSignUp = () => {
    try {
      setIsLoading(true);
      signOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text category="h2" style={styles.header}>
        Welcome {currentUser?.email || currentUser?.phoneNumber}!
      </Text>
      <Button disabled={isLoading} accessoryLeft={isLoading && (() => <Spinner />)} onPress={onPressSignUp}>
        Cerrar sesión
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 30,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    marginVertical: 5,
    textAlign: 'center',
  },
});

export default Welcome;
