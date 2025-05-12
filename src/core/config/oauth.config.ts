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

export const getOAuthConfig = (config: Config = CONFIG): OAuthConfig => {
  // Base URL from environment or default to localhost
  const baseUrl = process.env.APP_URL || `http://localhost:${config.port}`;

  // Get API prefixes from config
  const apiPrefix = config.api.prefix;
  const authPrefix = config.api.auth.prefix;
  const oauthPrefix = config.api.auth.oauth.prefix;

  // Build the base path for OAuth routes
  const oauthBasePath = `${apiPrefix}${authPrefix}${oauthPrefix}`;

  // Get callback URLs from config or build default ones
  const googleCallbackURL =
    config.api.auth.oauth.callbackUrls.google ||
    `${baseUrl}${oauthBasePath}/google/callback`;
  const facebookCallbackURL =
    config.api.auth.oauth.callbackUrls.facebook ||
    `${baseUrl}${oauthBasePath}/facebook/callback`;
  const githubCallbackURL =
    config.api.auth.oauth.callbackUrls.github ||
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
