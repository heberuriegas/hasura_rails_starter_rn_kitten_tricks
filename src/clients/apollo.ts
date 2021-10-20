import { ApolloClient, ApolloLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from '@apollo/client/link/context';
import { persistCache } from 'apollo3-cache-persist';
import { OAuthCredentials } from '../../types/credentials';
import { authAxios } from './axios';
import { API_URL, AUTH_CLIENT_ID } from '@env';

let apolloClient: ApolloClient<NormalizedCacheObject>;

const createApolloClient = async () => {
  const cache = new InMemoryCache();

  const authLink = setContext(async (_, { headers, response }) => {
    const credentials = await AsyncStorage.getItem('credentials');
    let authenticationHeaders: OAuthCredentials = JSON.parse(credentials);

    if (authenticationHeaders && authenticationHeaders.accessToken) {
      const currentTimestamp = +new Date() / 1000;
      const expireTimestamp = authenticationHeaders.createdAt + authenticationHeaders.expiresIn;

      if (currentTimestamp - expireTimestamp > 0) {
        const newCredentials = await authAxios.post<OAuthCredentials>('/oauth/token', {
          clientId: AUTH_CLIENT_ID,
          grantType: 'refresh_token',
          refreshToken: authenticationHeaders.refreshToken,
        });
        authenticationHeaders = newCredentials.data;
        await AsyncStorage.setItem('credentials', JSON.stringify(authenticationHeaders));
      }
    }

    const _headers = {
      headers: Object.assign(
        {
          ...headers,
        },
        authenticationHeaders && authenticationHeaders.accessToken
          ? {
              Authorization: `${authenticationHeaders.tokenType} ${authenticationHeaders.accessToken}`,
            }
          : {},
      ),
    };

    return _headers;
  });

  const httpLink = createHttpLink({
    uri: API_URL,
  });

  // await before instantiating ApolloClient, else queries might run before the cache is persisted
  await persistCache({
    cache,
    storage: AsyncStorage,
  });

  return new ApolloClient({
    cache,
    link: ApolloLink.from([authLink, httpLink as unknown as ApolloLink]),
  });
};

export const getApolloClient = async () => {
  const _apolloClient: ApolloClient<NormalizedCacheObject> = apolloClient ?? (await createApolloClient());
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
};
