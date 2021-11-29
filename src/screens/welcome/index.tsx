import React, { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Spinner } from '@ui-kitten/components';
import SafeAreaContainer from '../../components/safe-area-container.component';

export const Welcome = ({ navigation }) => {
  const { currentUser } = useAuth();

  return (
    <SafeAreaContainer navigation={navigation}>
      <View style={styles.container}>
        <Text category="h2" style={styles.header}>
          Welcome {currentUser?.email || currentUser?.phoneNumber}!
        </Text>
      </View>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
  profileAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignSelf: 'center',
    backgroundColor: '#fff',
    tintColor: '#ccc',
  },
  editAvatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

export default Welcome;
