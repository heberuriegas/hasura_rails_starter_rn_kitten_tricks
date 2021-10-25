import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Input, Spinner, Text } from '@ui-kitten/components';
import { ImageOverlay } from './extra/image-overlay.component';
import { EmailIcon } from './extra/icons';
import { KeyboardAvoidingView } from './extra/3rd-party';
import { useAuth } from '../../../../hooks/use-auth';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { UserForgotPassword } from '../../../../context/auth/auth.context.types';
import { useToast } from 'react-native-toast-notifications';

export default ({ navigation }): React.ReactElement => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { forgotPassword } = useAuth();
  const toast = useToast();

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Required'),
  });

  const { values, touched, errors, submitForm, handleChange, handleBlur } = useFormik<UserForgotPassword>({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: async (_values, { setErrors, resetForm }) => {
      setIsLoading(true);
      try {
        await forgotPassword(_values);
        // eslint-disable-next-line
        toast.show("You'll receive an email with a password reset link", {
          type: 'success',
        });
        resetForm();
        navigation && navigation.navigate('SignIn');
      } catch (err) {
        const dataErrors = err?.response?.data?.errors;
        if (dataErrors) {
          setErrors(dataErrors);
        } else {
          console.error(err);
          toast.show('We are sorry, something went wrong.', {
            type: 'danger',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const onSignInButtonPress = (): void => {
    navigation && navigation.navigate('SignIn');
  };

  return (
    <KeyboardAvoidingView>
      <ImageOverlay style={styles.container} source={require('./assets/image-background.jpg')}>
        <Text style={styles.forgotPasswordLabel} category="h4" status="control">
          Forgot Password
        </Text>
        <Text style={styles.enterEmailLabel} status="control">
          Please enter your email address
        </Text>
        <View style={styles.formContainer}>
          <Input
            status="control"
            placeholder="Email"
            accessoryLeft={EmailIcon}
            value={values.email}
            onBlur={handleBlur('email')}
            onChangeText={handleChange('email')}
          />
          {touched.email && errors.email ? <Text status="danger">{errors.email as string}</Text> : null}
        </View>
        <Button
          size="giant"
          onPress={submitForm}
          disabled={isLoading}
          accessoryLeft={isLoading ? () => <Spinner /> : null}
        >
          RESET PASSWORD
        </Button>
        <Button style={styles.signInButton} appearance="ghost" status="control" onPress={onSignInButtonPress}>
          Go back to Sign In
        </Button>
      </ImageOverlay>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  formContainer: {
    flex: 1,
    marginTop: 24,
  },
  forgotPasswordLabel: {
    zIndex: 1,
    alignSelf: 'center',
    marginTop: 24,
  },
  enterEmailLabel: {
    zIndex: 1,
    alignSelf: 'center',
    marginTop: 64,
  },
  signInButton: {
    marginVertical: 12,
    marginHorizontal: 16,
  },
});
