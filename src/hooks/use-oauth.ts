import { authorize } from 'react-native-app-auth';
import { useAuth } from './use-auth';
import { OAUTH2_HOST, OAUTH2_CLIENT_ID, OAUTH2_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '@env';

interface UseOAuthRespnse {
  oauth2SignIn: () => void;
  githubSignIn: () => void;
}

type UseOAuth = () => UseOAuthRespnse;

const useOAuth: UseOAuth = () => {
  const { signInByAssertion } = useAuth();

  const oauth2SignIn = async () => {
    const oauth2Config = {
      redirectUrl: 'com.disciplind.auth://oauthredirect',
      clientId: OAUTH2_CLIENT_ID,
      clientSecret: OAUTH2_CLIENT_SECRET,
      dangerouslyAllowInsecureHttpRequests: __DEV__,
      additionalHeaders: { Accept: 'application/json' },
      scopes: [],
      usePkce: true,
      serviceConfiguration: {
        authorizationEndpoint: `${OAUTH2_HOST}/oauth/authorize`,
        tokenEndpoint: `${OAUTH2_HOST}/oauth/token`,
        revocationEndpoint: `${OAUTH2_HOST}/oauth/revoke`,
      },
    };
    // Log in to get an authentication token
    const authState = await authorize(oauth2Config);
  };

  const githubSignIn = async () => {
    const githubConfig = {
      redirectUrl: 'com.disciplind.auth://oauthredirect',
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
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

    await signInByAssertion({
      provider: 'github',
      assertion: authState.accessToken,
    });
  };

  return { githubSignIn, oauth2SignIn };
};

export default useOAuth;
