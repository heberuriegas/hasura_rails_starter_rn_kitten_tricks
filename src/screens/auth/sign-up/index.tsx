import React, { ReactElement } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import { Button, CheckBox, Input, StyleService, Text, useStyleSheet, Icon } from '@ui-kitten/components';
import { ImageOverlay } from './extra/image-overlay.component';
import { ProfileAvatar } from './extra/profile-avatar.component';
import { EmailIcon, FacebookIcon, GoogleIcon, PersonIcon, PlusIcon, TwitterIcon } from './extra/icons';
import { KeyboardAvoidingView } from './extra/3rd-party';
import { GithubIcon } from '../../../kitten-tricks/components/icons';
import { authorize } from 'react-native-app-auth';

const SignUpScreen = ({ navigation }): React.ReactElement => {
  const [userName, setUserName] = React.useState<string>();
  const [email, setEmail] = React.useState<string>();
  const [password, setPassword] = React.useState<string>();
  const [termsAccepted, setTermsAccepted] = React.useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);

  const styles = useStyleSheet(themedStyles);

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
      clientId: 'v2VF-yh63gh3Dw-38H1IwWdrrqVXmJHXVrxAjcG-O_k',
      clientSecret: 'kTVZ0ejjweTjYxWoDfZbDzKYxVDi-7WqZwb-QNLF2Ws',
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
    console.log({ authState });
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
  };

  return (
    <KeyboardAvoidingView>
      <ImageOverlay style={styles.container} source={require('./assets/image-background.jpg')}>
        <View style={styles.headerContainer}>
          <ProfileAvatar
            style={styles.profileAvatar}
            resizeMode="center"
            source={require('./assets/image-person.png')}
            editButton={renderPhotoButton}
          />
        </View>
        <View style={styles.formContainer}>
          <Input
            status="control"
            autoCapitalize="none"
            placeholder="User Name"
            accessoryRight={PersonIcon}
            value={userName}
            onChangeText={setUserName}
          />
          <Input
            style={styles.formInput}
            status="control"
            autoCapitalize="none"
            placeholder="Email"
            accessoryRight={EmailIcon}
            value={email}
            onChangeText={setEmail}
          />
          <Input
            style={styles.formInput}
            status="control"
            autoCapitalize="none"
            secureTextEntry={!passwordVisible}
            placeholder="Password"
            accessoryRight={renderPasswordIcon}
            value={password}
            onChangeText={setPassword}
          />
          <CheckBox
            style={styles.termsCheckBox}
            checked={termsAccepted}
            onChange={(checked: boolean) => setTermsAccepted(checked)}
          >
            {renderCheckboxLabel}
          </CheckBox>
        </View>
        <Button style={styles.signUpButton} size="giant" onPress={onSignUpButtonPress}>
          SIGN UP
        </Button>
        <View style={styles.socialAuthContainer}>
          <Text style={styles.socialAuthHintText} status="control">
            Or Register Using Social Media
          </Text>
          <View style={styles.socialAuthButtonsContainer}>
            <Button size="giant" status="control" accessoryLeft={GithubIcon} onPress={backendSignIn}>
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
    minHeight: 176,
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
