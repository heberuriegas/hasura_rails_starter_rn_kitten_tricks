import { ApolloClient, ApolloLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from '@apollo/client/link/context';
import { persistCache } from 'apollo3-cache-persist';
import { onError } from 'apollo-link-error';
import { OAuthCredentials } from '../../types/credentials';
import { authAxios } from './axios';
import { API_URL, AUTH_CLIENT_ID } from '@env';

let apolloClient: ApolloClient<NormalizedCacheObject>;

export const isUnauthenticated = (graphqlError, options = { includeForbidden: true }) => {
  let _isUnauthenticated = false;
  switch (graphqlError?.extensions?.code) {
    // Apollo Server sets code to UNAUTHENTICATED
    // when an AuthenticationError is thrown in a resolver
    case 'UNAUTHENTICATED':
    case 'access-denied':
      _isUnauthenticated = true;
  }
  return _isUnauthenticated;
};

const createApolloClient = async () => {
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          YOUR_FIELD: {
            merge: true,
          },
        },
      },
    },
  });

  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (isUnauthenticated(err)) {
          new Promise<void>(async () => {
            try {
              const { refreshToken }: OAuthCredentials = JSON.parse(await AsyncStorage.getItem('credentials'));

              const credentials = await authAxios.post<OAuthCredentials>('/oauth/token', {
                data: {
                  clientId: AUTH_CLIENT_ID,
                  grantType: 'refresh_token',
                  refreshToken,
                },
              });
              await AsyncStorage.setItem('credentials', JSON.stringify(credentials.data));
            } catch (_err) {
              await AsyncStorage.setItem('credentials', null);
            }

            return forward(operation);
          });
        }
      }
    }

    // To retry on network errors, we recommend the RetryLink
    // instead of the onError link. This just logs the error.
    if (networkError) {
      // console.log(`[Network error]: ${networkError}`);
    }
  });

  const authLink = setContext(async (_, { headers, response }) => {
    const credentials = await AsyncStorage.getItem('credentials');
    const authenticationHeaders: OAuthCredentials = JSON.parse(credentials);
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
    link: ApolloLink.from([authLink, errorLink as unknown as ApolloLink, httpLink as unknown as ApolloLink]),
  });
};

export const getApolloClient = async () => {
  const _apolloClient: ApolloClient<NormalizedCacheObject> = apolloClient ?? (await createApolloClient());
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
};
