import { useLazyQuery } from '@apollo/client';
import { AUTH_CLIENT_ID } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { camelizeKeys } from 'humps';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { EventRegister } from 'react-native-event-listeners';
import { useToast } from 'react-native-toast-notifications';
import { User } from 'types/user';
import { OAuthCredentials } from '../../../types/credentials';
import { getApolloClient } from '../../clients/apollo';
import { authAxios } from '../../clients/axios';
import meQuery from '../../queries/users/me.graphql';
import updateCurrentUserQuery from '../../queries/users/update.graphql';
import {
  AuthContextData,
  ForgotPassword,
  ForgotPasswordData,
  SignInByAssertion,
  SignInByEmail,
  SignInByOAuth2,
  SignInByPhoneNumber,
  SignOut,
  SignUpByEmail,
  SignUpByPhoneNumber,
  SignUpData,
  UpdateUser,
  UpdateUserParams,
} from './auth.context.types';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>();
  const [displayName, setDisplayName] = useState<string>('');
  const [isSignedIn, setIsSignedIn] = useState<boolean>();
  const [setupIsLoading, setSetupIsLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.name || currentUser.username || currentUser.email || currentUser.phoneNumber);
    } else {
      setDisplayName('');
    }
  }, [currentUser]);

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
    fetchPolicy: 'network-only',
  });

  const refreshUser = async () => {
    const credentials = await AsyncStorage.getItem('credentials');
    const apolloClient = await getApolloClient();
    if (credentials) {
      const { data: userData } = await apolloClient.query<{ me: User }, void>({
        query: meQuery,
        fetchPolicy: 'network-only',
      });
      if (userData && userData.me) {
        setCurrentUser(camelizeKeys(userData.me));
      }
    }
  };

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
      setCurrentUser(camelizeKeys(me));
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
    const credentialsString = await AsyncStorage.getItem('credentials');
    if (credentialsString) {
      const token = JSON.parse(credentialsString);
      await authAxios.post('/oauth/revoke', {
        clientId: AUTH_CLIENT_ID,
        token,
      });
    }
    await AsyncStorage.removeItem('credentials');
    setCurrentUser(null);
  };

  const updateUser: UpdateUser = useCallback(
    async userData => {
      const apolloClient = await getApolloClient();
      const result = await apolloClient.mutate<
        { update_users_by_pk: User },
        { pk_columns: { id: Number }; _set: UpdateUserParams }
      >({
        mutation: updateCurrentUserQuery,
        variables: {
          pk_columns: { id: currentUser.id },
          _set: userData,
        },
      });
      const user = result.data.update_users_by_pk;
      setCurrentUser(user);
      return user;
    },
    [currentUser],
  );

  return (
    // This component will be used to encapsulate the whole App,
    // so all components will have access to the Context
    <AuthContext.Provider
      value={{
        isSignedIn,
        currentUser,
        displayName,
        refreshUser,
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
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
