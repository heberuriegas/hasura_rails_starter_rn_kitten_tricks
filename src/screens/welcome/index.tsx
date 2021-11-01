import React, { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Spinner, StyleService } from '@ui-kitten/components';
import { PlusIcon } from './extra/icons';
import { ProfileAvatar } from './extra/profile-avatar.component';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDirectUpload } from 'react-native-activestorage';

const onSuccess = ({ signedIds }) => {
  // Do something;
  // console.log({ signedIds });
};

const onError = error => {
  // Do something;
  // console.error('myError', error);
};

const Welcome = () => {
  const [isLoading, setIsLoading] = useState<boolean>();

  const { currentUser, signOut } = useAuth();
  const { upload, uploading, uploads } = useDirectUpload({ onSuccess, onError });

  const onUploadButtonClick = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      async response => {
        const files = response.assets.map(file => ({
          name: file.fileName,
          size: file.fileSize,
          type: file.type,
          path: file.uri.replace('file://', ''),
        }));

        const { signedIds } = await upload(files);
      },
    );

    // Assign signed IDs
  };

  const renderPhotoButton = (): React.ReactElement => (
    <Button style={styles.editAvatarButton} size="small" accessoryRight={PlusIcon} onPress={onUploadButtonClick} />
  );

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
      <ProfileAvatar
        style={styles.profileAvatar}
        resizeMode="center"
        source={require('./assets/image-person.png')}
        editButton={renderPhotoButton}
      />
      {uploads.map((_upload, i) => (
        <Text key={i}>{_upload.file.name}</Text>
      ))}
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
