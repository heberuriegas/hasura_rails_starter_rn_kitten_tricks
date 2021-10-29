import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, createContext } from 'react';
import meQuery from '../../queries/users/me.graphql';
// import updateCurrentUserQuery from '../../queries/graphql/users/updateUser.graphql';
import { EventRegister } from 'react-native-event-listeners';
import { AUTH_CLIENT_ID } from '@env';
import { useLazyQuery } from '@apollo/client';
import { authAxios } from '../../clients/axios';
import {
  AuthContextData,
  SignUpData,
  SignInByEmail,
  SignInByPhoneNumber,
  SignInByAssertion,
  SignOut,
} from './auth.context.types';
import { User } from 'types/user';
import { OAuthCredentials } from '../../../types/credentials';
import {
  SignUpByEmail,
  ForgotPassword,
  ForgotPasswordData,
  SignInByOAuth2,
  SignUpByPhoneNumber,
} from './auth.context.types';
import { useToast } from 'react-native-toast-notifications';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>();
  const [isSignedIn, setIsSignedIn] = useState<boolean>();
  const [setupIsLoading, setSetupIsLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    const listener = EventRegister.addEventListener('unauthenticate', () => {
      setCurrentUser(null);
    });
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  const [getCurrentUser, { data: { me } = { me: null }, loading: userLoading, error }] = useLazyQuery<
    { me: User },
    void
  >(meQuery, {
    context: { clientName: 'V2' },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    try {
      AsyncStorage.getItem('credentials').then(credentials => {
        if (credentials) {
          getCurrentUser();
        } else {
          setSetupIsLoading(false);
        }
      });
    } catch (err) {
      setCurrentUser(undefined);
    }
  }, []);

  useEffect(() => {
    if (me) {
      setCurrentUser(me);
    }
    if (me || error) {
      setSetupIsLoading(false);
    }
  }, [me, error]);

  useEffect(() => {
    setIsSignedIn(Boolean(currentUser));
  }, [currentUser]);

  const sendOtp: SignInByPhoneNumber = async otp => {
    await authAxios.post('/api/auth/send_otp', { otp });
  };

  const signUpByEmail: SignUpByEmail = async user => {
    const signUpByEmailResult = await authAxios.post<SignUpData>(
      '/users.json',
      { user },
      {
        headers: {
          'Client-Id': AUTH_CLIENT_ID,
        },
      },
    );

    if (signUpByEmailResult.data.credentials) {
      await AsyncStorage.setItem('credentials', JSON.stringify(signUpByEmailResult.data.credentials));
      setCurrentUser(signUpByEmailResult.data.user);
    } else {
      toast.show(
        'Please confirm your email address by clicking on the link in the confirmation email sent to your account.',
      );
    }
  };

  const signUpByPhoneNumber: SignUpByPhoneNumber = async user => {
    const response = await authAxios.post<SignUpData>(
      '/users.json',
      { user },
      {
        headers: {
          'Client-Id': AUTH_CLIENT_ID,
        },
      },
    );

    toast.show(
      'Please confirm your email address by clicking on the link in the confirmation email sent to your account.',
    );

    return response.data;
  };

  const signInByEmail: SignInByEmail = async ({ email, password }) => {
    const loginData = await authAxios.post<OAuthCredentials>('/oauth/token', {
      grantType: 'password',
      clientId: AUTH_CLIENT_ID,
      email,
      password,
    });

    await AsyncStorage.setItem('credentials', JSON.stringify(loginData.data));
    await getCurrentUser();
  };

  const forgotPassword: ForgotPassword = async user => {
    await authAxios.post<ForgotPasswordData>('/users/password.json', { user });
  };

  const signInByPhoneNumber: SignInByPhoneNumber = async ({ phoneNumber, otpCode }) => {
    const loginData = await authAxios.post<OAuthCredentials>('/oauth/token', {
      grantType: 'password',
      clientId: AUTH_CLIENT_ID,
      phoneNumber,
      otpCode,
    });

    await AsyncStorage.setItem('credentials', JSON.stringify(loginData.data));
    await getCurrentUser();
  };

  const signInByAssertion: SignInByAssertion = async ({ provider, assertion }) => {
    const loginData = await authAxios.post<OAuthCredentials>('/oauth/token', {
      grantType: 'assertion',
      clientId: AUTH_CLIENT_ID,
      provider,
      assertion,
    });

    await AsyncStorage.setItem('credentials', JSON.stringify(loginData.data));
    await getCurrentUser();
  };

  const signInByOAuth2: SignInByOAuth2 = async authState => {
    const expiresIn = Math.floor((Date.parse(authState.accessTokenExpirationDate) - new Date().getTime()) / 1000);
    const credentials = {
      accessToken: authState.accessToken,
      tokenType: authState.tokenType,
      expiresIn: expiresIn,
      refreshToken: authState.refreshToken,
      scope: authState.scopes,
      createdAt: authState.tokenAdditionalParameters.created_at,
    };

    await AsyncStorage.setItem('credentials', JSON.stringify(credentials));
    await getCurrentUser();
  };

  // Remove data from context, so the App can be notified and send the user to the AuthStack
  const signOut: SignOut = async () => {
    const token = JSON.parse(await AsyncStorage.getItem('credentials'));
    await AsyncStorage.removeItem('credentials');
    setCurrentUser(null);
    await authAxios.post('/oauth/revoke', {
      clientId: AUTH_CLIENT_ID,
      token,
    });
  };

  const update = async (userData: User) => {
    // // Remove data from context, so the App can be notified
    // // and send the user to the AuthStack
    // const {
    //   data: { update_users_by_pk: user },
    // } = await updateCurrentUser({
    //   variables: {
    //     id: currentUser.id,
    //     user: userData,
    //   },
    // });
    // setCurrentUser(user);
  };

  return (
    // This component will be used to encapsulate the whole App,
    // so all components will have access to the Context
    <AuthContext.Provider
      value={{
        isSignedIn,
        currentUser,
        setCurrentUser,
        userLoading: setupIsLoading || userLoading,
        signUpByEmail,
        signUpByPhoneNumber,
        sendOtp,
        signInByEmail,
        forgotPassword,
        signInByPhoneNumber,
        signInByAssertion,
        signInByOAuth2,
        signOut,
        update,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
