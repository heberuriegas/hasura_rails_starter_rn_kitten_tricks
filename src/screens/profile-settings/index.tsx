import React, { useState } from 'react';
import { ScrollView, Image } from 'react-native';
import { Button, StyleService, useStyleSheet, Avatar } from '@ui-kitten/components';
import { ProfileAvatar } from './extra/profile-avatar.component';
import { ProfileSetting } from './extra/profile-setting.component';
import { CameraIcon } from './extra/icons';
import SafeAreaContainer from 'src/components/safe-area-container.component';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User } from '../../../types/user';
import { useAuth } from '../../hooks/use-auth';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDirectUpload } from 'react-native-activestorage';
import CreateAttachmentQuery from '../../queries/attachments/create-attachment.graphql';
import { useMutation } from '@apollo/client';
import { useToast } from 'react-native-toast-notifications';

type UpdateUser = Omit<User, 'id' | 'email' | 'avatarUrl' | 'avatarThumbnailUrl' | 'createdAt' | 'updatedAt'>;

export default ({ navigation }): React.ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>();
  const styles = useStyleSheet(themedStyle);
  const { currentUser, refreshUser } = useAuth();
  const toast = useToast();

  const [createAttachment, response] = useMutation(CreateAttachmentQuery);

  const validationSchema = Yup.object({
    name: Yup.string().min(3).max(50),
    // email: Yup.string().email(),
    phoneNumber: Yup.string().phone().required('Required'),
  });

  const { values, touched, errors, submitForm, handleChange, handleBlur } = useFormik<UpdateUser>({
    initialValues: {
      name: currentUser?.name || '',
      // email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
    },
    validationSchema,
    onSubmit: async (_values, { setErrors, resetForm }) => {
      console.log({ _values });

      navigation && navigation.goBack();
    },
  });

  const onSuccess = async ({ signedIds }) => {
    // Do something;

    if (currentUser && signedIds?.[0]) {
      await createAttachment({
        variables: {
          signedId: signedIds[0],
          relatedId: Number(currentUser.id),
          relatedType: 'User',
          attribute: 'avatar',
        },
      });

      await refreshUser();
    } else {
      toast.show('Something went wrong uploading the attachment');
    }
  };

  const onError = error => {
    // Do something;
    // console.error('myError', error);
  };
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

        await upload(files);
      },
    );

    // Assign signed IDs
  };

  const renderPhotoButton = (): React.ReactElement => (
    <Button style={styles.editAvatarButton} status="basic" accessoryLeft={CameraIcon} onPress={onUploadButtonClick} />
  );

  return (
    <SafeAreaContainer navigation={navigation}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ProfileAvatar
          source={
            currentUser?.avatarThumbnailUrl
              ? { uri: currentUser.avatarThumbnailUrl }
              : require('../../assets/images/image-person.png')
          }
          editButton={renderPhotoButton}
        />
        <ProfileSetting
          style={[styles.profileSetting, styles.section]}
          hint="Name"
          showErrorMessage={touched.name && Boolean(errors.name)}
          errorMessage={errors.name}
          inputProps={{
            onChangeText: handleChange('name'),
            onBlur: handleBlur('name'),
            value: values.name,
          }}
        />
        {/* <ProfileSetting
          style={[styles.profileSetting, styles.section]}
          hint="Email"
          editable={false}
          inputProps={{
            onChangeText: handleChange('email'),
            onBlur: handleBlur('email'),
            value: values.email,
          }}
        />
        <ProfileSetting
          style={[styles.profileSetting]}
          hint="Password"
          editable={false}
          inputProps={{
            onChangeText: handleChange('password'),
            onBlur: handleBlur('password'),
            value: values.password,
          }}
        />
        <ProfileSetting
          style={[styles.profileSetting]}
          hint="Password confirmation"
          editable={false}
          inputProps={{
            onChangeText: handleChange('passwordConfirmation'),
            onBlur: handleBlur('passwordConfirmation'),
            value: values.passwordConfirmation,
          }}
        /> */}
        <ProfileSetting
          style={styles.profileSetting}
          hint="Phone Number"
          editable={false}
          inputProps={{
            onChangeText: handleChange('phoneNumber'),
            onBlur: handleBlur('phoneNumber'),
            value: values.phoneNumber,
          }}
        />
        <Button style={styles.doneButton} onPress={submitForm}>
          DONE
        </Button>
      </ScrollView>
    </SafeAreaContainer>
  );
};

const themedStyle = StyleService.create({
  container: {
    flex: 1,
    backgroundColor: 'background-basic-color-2',
  },
  contentContainer: {
    paddingVertical: 24,
  },
  editAvatarButton: {
    aspectRatio: 1.0,
    height: 48,
    borderRadius: 24,
  },
  profileSetting: {
    padding: 16,
    paddingVertical: 5,
  },
  section: {
    marginTop: 24,
  },
  doneButton: {
    marginHorizontal: 24,
    marginTop: 24,
  },
});
