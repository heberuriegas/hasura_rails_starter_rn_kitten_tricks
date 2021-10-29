import React, { ReactElement } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback } from 'react-native';
import { Button, Input, Text, Icon, Spinner } from '@ui-kitten/components';
import { ImageOverlay } from './extra/image-overlay.component';
import { LockIcon } from './extra/icons';
import { KeyboardAvoidingView } from './extra/3rd-party';
import { useFormik } from 'formik';
import { UserSignInByEmail } from '../../../../context/auth/auth.context.types';
import { useAuth } from '../../../../hooks/use-auth';
import { useToast } from 'react-native-toast-notifications';
import useOAuth2 from '../../../../hooks/use-oauth2';
import * as Yup from 'yup';
import YupPassword from 'yup-password';
YupPassword(Yup);

export default ({ navigation }): React.ReactElement => {
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const [signInIsLoading, setSignInIsLoading] = React.useState<boolean>(false);
  const [githubIsLoading, setGithubIsLoading] = React.useState<boolean>(false);
  const toast = useToast();

  const { signInByEmail } = useAuth();
  const { githubSignIn } = useOAuth2();

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Required'),
    password: Yup.string().password().required('Required'),
  });

  const { values, touched, errors, submitForm, handleChange, handleBlur } = useFormik<UserSignInByEmail>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (_values, { setErrors, resetForm }) => {
      setSignInIsLoading(true);
      try {
        await signInByEmail(_values);
        resetForm();
      } catch (err) {
        const dataErrors = err?.response?.data?.errors;
        if (dataErrors) {
          setErrors(dataErrors);
        } else {
          console.error(err);
          toast.show('Invalid username or password', {
            type: 'warning',
          });
        }
      } finally {
        setSignInIsLoading(false);
      }
    },
  });

  const onSignUpButtonPress = (): void => {
    navigation && navigation.navigate('SignUp');
  };

  const onForgotPasswordButtonPress = (): void => {
    navigation && navigation.navigate('ForgotPassword');
  };

  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  const onGithubSignInPress = async (): Promise<void> => {
    setGithubIsLoading(true);
    try {
      await githubSignIn();
    } catch (err) {
      console.error(err);
      toast.show('User authentication failed due to invalid authentication values', { type: 'danger' });
    } finally {
      setGithubIsLoading(false);
    }
  };

  const renderPasswordIcon = (props): ReactElement => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  return (
    <KeyboardAvoidingView>
      <ImageOverlay style={styles.container} source={require('./assets/image-background.jpg')}>
        <View style={styles.headerContainer}>
          <Text category="h1" status="control">
            Hello
          </Text>
          <Text style={styles.signInLabel} category="s1" status="control">
            Sign in to your account
          </Text>
        </View>
        <View style={styles.formContainer}>
          <Input
            style={styles.passwordInput}
            status="control"
            placeholder="Password"
            accessoryLeft={LockIcon}
            accessoryRight={renderPasswordIcon}
            secureTextEntry={!passwordVisible}
            value={values.password}
            onBlur={handleBlur('password')}
            onChangeText={handleChange('password')}
          />
          {touched.password && errors.password ? <Text status="danger">{errors.password as string}</Text> : null}
          <View style={styles.forgotPasswordContainer}>
            <Button
              style={styles.forgotPasswordButton}
              appearance="ghost"
              status="control"
              onPress={onForgotPasswordButtonPress}
            >
              Forgot your password?
            </Button>
          </View>
        </View>
        <Button
          style={styles.signInButton}
          size="giant"
          onPress={submitForm}
          disabled={githubIsLoading || signInIsLoading}
          accessoryLeft={signInIsLoading ? () => <Spinner /> : null}
        >
          Validate OTP
        </Button>
        <Button style={styles.signUpButton} appearance="ghost" status="control" onPress={onSignUpButtonPress}>
          Try another phone number
        </Button>
      </ImageOverlay>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    minHeight: 216,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  signInLabel: {
    marginTop: 16,
  },
  passwordInput: {
    marginTop: 16,
  },
  signInButton: {
    marginHorizontal: 16,
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  forgotPasswordButton: {
    paddingHorizontal: 0,
  },
  signUpButton: {
    marginVertical: 12,
  },
  socialAuthContainer: {
    marginTop: 32,
  },
  socialAuthButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  socialAuthHintText: {
    alignSelf: 'center',
    marginBottom: 16,
  },
});
