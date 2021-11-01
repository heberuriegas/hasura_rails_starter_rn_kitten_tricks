import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OAuthCredentials } from '../../../types/credentials';
import { AUTH_URL } from '@env';
import { ActiveStorageProvider } from 'react-native-activestorage';
import Welcome from 'src/screens/welcome';

const AppContent = () => {
  const [activeStorageHeaders, setActiveStorageHeaders] = useState<{ [key: string]: string }>();

  useEffect(() => {
    (async () => {
      const credentialsString = await AsyncStorage.getItem('credentials');
      if (credentialsString) {
        const credentials: OAuthCredentials = JSON.parse(credentialsString);
        setActiveStorageHeaders({ Authorization: `Bearer ${credentials.accessToken}` });
      }
    })();
  }, []);

  return (
    <ActiveStorageProvider host={AUTH_URL} mountPath="/api" headers={activeStorageHeaders}>
      <Welcome />
    </ActiveStorageProvider>
  );
};

export default AppContent;
