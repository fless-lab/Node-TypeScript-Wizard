import { Config } from './index';

export interface OAuthProviderConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  callbackURL: string;
  scope: string[];
}

export interface OAuthConfig {
  google: OAuthProviderConfig;
  facebook: OAuthProviderConfig;
  github: OAuthProviderConfig;
}

export const getOAuthConfig = (config: Config): OAuthConfig => {
  // Base URL from environment or default to localhost
  const baseUrl = process.env.APP_URL || `http://localhost:${config.port}`;

  // API prefix from environment or default to /api/v1
  const apiPrefix = process.env.API_PREFIX || '/api/v1';

  // Auth route prefix from environment or default to /auth
  const authPrefix = process.env.AUTH_PREFIX || '/auth';

  // OAuth route prefix from environment or default to /oauth
  const oauthPrefix = process.env.OAUTH_PREFIX || '/oauth';

  // Build the base path for OAuth routes
  const oauthBasePath = `${apiPrefix}${authPrefix}${oauthPrefix}`;

  // Allow overriding callback URLs per provider
  const googleCallbackURL =
    process.env.OAUTH_GOOGLE_CALLBACK_URL ||
    `${baseUrl}${oauthBasePath}/google/callback`;
  const facebookCallbackURL =
    process.env.OAUTH_FACEBOOK_CALLBACK_URL ||
    `${baseUrl}${oauthBasePath}/facebook/callback`;
  const githubCallbackURL =
    process.env.OAUTH_GITHUB_CALLBACK_URL ||
    `${baseUrl}${oauthBasePath}/github/callback`;

  return {
    google: {
      enabled: process.env.OAUTH_GOOGLE_ENABLED === 'true',
      clientId: process.env.OAUTH_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || '',
      callbackURL: googleCallbackURL,
      scope: ['profile', 'email'],
    },
    facebook: {
      enabled: process.env.OAUTH_FACEBOOK_ENABLED === 'true',
      clientId: process.env.OAUTH_FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.OAUTH_FACEBOOK_CLIENT_SECRET || '',
      callbackURL: facebookCallbackURL,
      scope: ['email', 'public_profile'],
    },
    github: {
      enabled: process.env.OAUTH_GITHUB_ENABLED === 'true',
      clientId: process.env.OAUTH_GITHUB_CLIENT_ID || '',
      clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET || '',
      callbackURL: githubCallbackURL,
      scope: ['user:email'],
    },
  };
};
