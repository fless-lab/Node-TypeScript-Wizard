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
  const baseUrl = process.env.APP_URL || `http://localhost:${config.port}`;

  return {
    google: {
      enabled: process.env.OAUTH_GOOGLE_ENABLED === 'true',
      clientId: process.env.OAUTH_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${baseUrl}/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    facebook: {
      enabled: process.env.OAUTH_FACEBOOK_ENABLED === 'true',
      clientId: process.env.OAUTH_FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.OAUTH_FACEBOOK_CLIENT_SECRET || '',
      callbackURL: `${baseUrl}/auth/facebook/callback`,
      scope: ['email', 'public_profile'],
    },
    github: {
      enabled: process.env.OAUTH_GITHUB_ENABLED === 'true',
      clientId: process.env.OAUTH_GITHUB_CLIENT_ID || '',
      clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET || '',
      callbackURL: `${baseUrl}/auth/github/callback`,
      scope: ['user:email'],
    },
  };
};
