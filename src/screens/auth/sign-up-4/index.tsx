import React, { ReactElement } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import { Button, CheckBox, Input, StyleService, Text, useStyleSheet, Icon, Spinner } from '@ui-kitten/components';
import { ImageOverlay } from './extra/image-overlay.component';
import { ProfileAvatar } from './extra/profile-avatar.component';
import { EmailIcon, FacebookIcon, GoogleIcon, GithubIcon, PersonIcon, PlusIcon, TwitterIcon } from './extra/icons';
import { KeyboardAvoidingView } from './extra/3rd-party';
import { authorize } from 'react-native-app-auth';
import { useAuth } from '../../../hooks/use-auth';
import { useFormik } from 'formik';
import { useToast } from 'react-native-toast-notifications';
import * as Yup from 'yup';
import YupPassword from 'yup-password';
import { UserRegistrationByEmail } from '../../../context/auth/auth.context.types';
YupPassword(Yup);

const SignUpScreen = ({ navigation }): React.ReactElement => {
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const toast = useToast();

  const { signInByAssertion, signInByEmail, signUpByEmail, isLoading } = useAuth();

  const styles = useStyleSheet(themedStyles);

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, 'Must have at least 3 characters')
      .max(15, 'Must be 15 characters or less')
      .required('Required'),
    name: Yup.string()
      .min(3, 'Must have at least 3 characters')
      .max(15, 'Must be 15 characters or less')
      .required('Required'),
    email: Yup.string().email('Invalid email address').required('Required'),
    password: Yup.string().password(),
    passwordConfirmation: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
    // termsAccepted: Yup.bool().oneOf([true], 'Field must be checked'),
  });

  const { values, touched, errors, submitForm, handleChange, handleBlur } = useFormik<UserRegistrationByEmail>({
    initialValues: {
      username: '',
      email: '',
      name: '',
      password: '',
      passwordConfirmation: '',
      // termsAccepted: false,
    },
    validationSchema,
    onSubmit: async (_values, { setErrors }) => {
      try {
        await signUpByEmail(_values);
        navigation && navigation.navigate('SignIn4');
      } catch (err) {
        const dataErrors = err?.response?.data?.errors;
        if (dataErrors) {
          setErrors(dataErrors);
        } else {
          console.error(err);
          toast.show('User cannot be created', {
            type: 'danger',
          });
        }
      }
    },
  });

  const onSignUpButtonPress = (): void => {
    navigation && navigation.goBack();
  };

  const onSignInButtonPress = (): void => {
    navigation && navigation.navigate('SignIn4');
  };

  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  const renderPhotoButton = (): React.ReactElement => (
    <Button style={styles.editAvatarButton} size="small" accessoryRight={PlusIcon} />
  );

  const renderPasswordIcon = (props): ReactElement => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  const renderCheckboxLabel = React.useCallback(
    evaProps => (
      <Text {...evaProps} style={styles.termsCheckBoxText}>
        I read and agree to Terms & Conditions
      </Text>
    ),
    [],
  );

  const backendSignIn = async () => {
    const doorkeeperSignIn = {
      redirectUrl: 'com.disciplind.auth://oauthredirect',
      clientId: 's_s6nFb7cKgISyPY6WPogb7T85ca4OqwJ7tsq7JUuvo',
      clientSecret: 's2d0gTNPl5ZRHL-O-UllAvap00BD_Jvm9K5A8dpWG_U',
      dangerouslyAllowInsecureHttpRequests: __DEV__,
      additionalHeaders: { Accept: 'application/json' },
      scopes: [],
      usePkce: true,
      serviceConfiguration: {
        authorizationEndpoint: 'http://192.168.0.200:3000/oauth/authorize',
        tokenEndpoint: 'http://192.168.0.200:3000/oauth/token',
        revocationEndpoint: 'http://192.168.0.200:3000/oauth/revoke',
      },
    };
    // Log in to get an authentication token
    const authState = await authorize(doorkeeperSignIn);
  };

  const githubSignIn = async () => {
    const githubConfig = {
      redirectUrl: 'com.disciplind.auth://oauthredirect',
      clientId: '6160786382f2f5221c40',
      clientSecret: '35df07973ff9e7c602e985bc930771612209f411',
      scopes: ['identity', 'user', 'user:email'],
      additionalHeaders: { Accept: 'application/json' },
      usePkce: true,
      serviceConfiguration: {
        authorizationEndpoint: 'https://github.com/login/oauth/authorize',
        tokenEndpoint: 'https://github.com/login/oauth/access_token',
        revocationEndpoint: 'https://github.com/settings/connections/applications/6160786382f2f5221c40',
      },
    };

    // Log in to get an authentication token
    const authState = await authorize(githubConfig);

    const result = await signInByAssertion({
      provider: 'github',
      assertion: authState.accessToken,
    });
  };

  return (
    <KeyboardAvoidingView>
      <ImageOverlay style={styles.container} source={require('./assets/image-background.jpg')}>
        {/* <View style={styles.headerContainer}>
          <ProfileAvatar
            style={styles.profileAvatar}
            resizeMode="center"
            source={require('./assets/image-person.png')}
            editButton={renderPhotoButton}
          />
        </View> */}
        <View style={styles.headerContainer}>
          <Text category="h1" status="control">
            Hello
          </Text>
          <Text category="s1" status="control">
            Sign up to your account
          </Text>
        </View>
        <View style={styles.formContainer}>
          <Input
            status="control"
            autoCapitalize="none"
            placeholder="Name"
            accessoryRight={PersonIcon}
            onChangeText={handleChange('name')}
            onBlur={handleBlur('name')}
            value={values.name}
          />
          {touched.name && errors.name ? <Text status="danger">{errors.name as string}</Text> : null}
          <Input
            style={styles.formInput}
            status="control"
            autoCapitalize="none"
            placeholder="User Name"
            accessoryRight={PersonIcon}
            onChangeText={handleChange('username')}
            onBlur={handleBlur('username')}
            value={values.username}
          />
          {touched.username && errors.username ? <Text status="danger">{errors.username as string}</Text> : null}
          <Input
            style={styles.formInput}
            status="control"
            autoCapitalize="none"
            placeholder="Email"
            accessoryRight={EmailIcon}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            value={values.email}
          />
          {touched.email && errors.email ? <Text status="danger">{errors.email as string}</Text> : null}
          <Input
            style={styles.formInput}
            status="control"
            autoCapitalize="none"
            secureTextEntry={!passwordVisible}
            placeholder="Password"
            accessoryRight={renderPasswordIcon}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
          />
          {touched.password && errors.password ? <Text status="danger">{errors.password as string}</Text> : null}
          <Input
            style={styles.formInput}
            status="control"
            autoCapitalize="none"
            secureTextEntry={!passwordVisible}
            placeholder="Password confirmation"
            accessoryRight={renderPasswordIcon}
            onChangeText={handleChange('passwordConfirmation')}
            onBlur={handleBlur('passwordConfirmation')}
            value={values.passwordConfirmation}
          />
          {touched.passwordConfirmation && errors.passwordConfirmation ? (
            <Text status="danger">{errors.passwordConfirmation as string}</Text>
          ) : null}
          {/* <CheckBox
            style={styles.termsCheckBox}
            onChange={handleChange}
            onBlur={handleBlur}
            checked={values.termsAccepted}
          >
            {renderCheckboxLabel}
          </CheckBox>
          {touched.termsAccepted && errors.termsAccepted ? (
            <Text status="danger">
              {errors.termsAccepted}
            </Text>
          ) : null} */}
        </View>
        <Button
          disabled={isLoading}
          accessoryLeft={isLoading ? () => <Spinner /> : null}
          style={styles.signUpButton}
          size="giant"
          onPress={submitForm}
        >
          SIGN UP
        </Button>
        <View style={styles.socialAuthContainer}>
          <Text style={styles.socialAuthHintText} status="control">
            Or Register Using Social Media
          </Text>
          <View style={styles.socialAuthButtonsContainer}>
            <Button
              disabled={isLoading}
              size="giant"
              status="control"
              accessoryLeft={isLoading ? () => <Spinner /> : GithubIcon}
              onPress={githubSignIn}
            >
              Sign up with Github
            </Button>
          </View>
        </View>
        <Button style={styles.signInButton} appearance="ghost" status="control" onPress={onSignInButtonPress}>
          Already have account? Sign In
        </Button>
      </ImageOverlay>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

const themedStyles = StyleService.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  profileAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignSelf: 'center',
    backgroundColor: 'background-basic-color-1',
    tintColor: 'text-hint-color',
  },
  editAvatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  formContainer: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  formInput: {
    marginTop: 16,
  },
  termsCheckBox: {
    marginTop: 24,
  },
  termsCheckBoxText: {
    color: 'text-control-color',
    marginLeft: 10,
  },
  signUpButton: {
    marginHorizontal: 16,
  },
  signInButton: {
    marginVertical: 12,
    marginHorizontal: 16,
  },
  socialAuthContainer: {
    marginTop: 24,
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
