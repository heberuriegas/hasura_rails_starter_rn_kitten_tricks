export interface OAuthCredentials {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  scope: string;
  createdAt: number;
}

export interface OAuthState {
  accessToken: string;
  tokenType: string;
  idToken: string;
  refreshToken: string;
  scopes: string[];
  authorizedAdditionalParameters: {
    [key: string]: string;
  };
  tokenAdditionalParameters: {
    [key: string]: string;
  };
}
