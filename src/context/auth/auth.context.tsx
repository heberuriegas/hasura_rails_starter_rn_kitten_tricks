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
  RegisterData,
  SignInByEmail,
  SignInByPhoneNumber,
  SignInByAssertion,
  SignOut,
} from './auth.context.types';
import { User } from 'types/user';
import { OAuthCredentials } from '../../../types/credentials';
import { SignUpByEmail } from './auth.context.types';
import { useToast } from 'react-native-toast-notifications';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>();
  const [isSignedIn, setIsSignedIn] = useState<boolean>();
  const [setupIsLoading, setSetupIsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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

  const sendOtp = async (phoneNumber: String, via: String = 'sms', validationHash?: String) => {
    // await fetch();
  };

  const signUpByEmail: SignUpByEmail = async user => {
    const signUpByEmailResult = await authAxios.post<RegisterData>(
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

  const signInByEmail: SignInByEmail = async ({ email, password, passwordConfirmation }) => {
    try {
      setIsLoading(true);
      const loginData = await authAxios.post<OAuthCredentials>('/oauth/token', {
        grantType: 'password',
        clientId: AUTH_CLIENT_ID,
        email,
        password,
        passwordConfirmation,
      });

      await AsyncStorage.setItem('credentials', JSON.stringify(loginData.data));
      await getCurrentUser();
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      return false;
    }
  };

  const signInByPhoneNumber: SignInByPhoneNumber = async ({ phoneNumber, otpCode }) => {
    try {
      setIsLoading(true);
      const loginData = await authAxios.post<OAuthCredentials>('/oauth/token', {
        grantType: 'password',
        clientId: AUTH_CLIENT_ID,
        phoneNumber,
        otpCode,
      });

      await AsyncStorage.setItem('credentials', JSON.stringify(loginData.data));
      await getCurrentUser();
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      return false;
    }
  };

  const signInByAssertion: SignInByAssertion = async ({ provider, assertion }) => {
    try {
      setIsLoading(true);
      const loginData = await authAxios.post<OAuthCredentials>('/oauth/token', {
        grantType: 'assertion',
        clientId: AUTH_CLIENT_ID,
        provider,
        assertion,
      });

      await AsyncStorage.setItem('credentials', JSON.stringify(loginData.data));
      await getCurrentUser();

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error(err);

      setIsLoading(false);
      return false;
    }
  };

  // Remove data from context, so the App can be notified and send the user to the AuthStack
  const signOut: SignOut = async () => {
    try {
      setIsLoading(true);
      const token = JSON.parse(await AsyncStorage.getItem('credentials'));
      await AsyncStorage.removeItem('credentials');
      setCurrentUser(null);
      await authAxios.post('/oauth/revoke', {
        clientId: AUTH_CLIENT_ID,
        token,
      });
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      return false;
    }
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
        isLoading,
        signUpByEmail,
        sendOtp,
        signInByEmail,
        signInByPhoneNumber,
        signInByAssertion,
        signOut,
        update,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
