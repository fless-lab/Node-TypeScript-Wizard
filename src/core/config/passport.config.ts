import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { getOAuthConfig } from './oauth.config';
import { ConfigService } from './index';

// Assuming LOGGER is defined globally
declare const LOGGER: any;

const oauthConfig = getOAuthConfig(ConfigService.getInstance().getConfig());

// Google Strategy
if (oauthConfig.google.enabled) {
  LOGGER.info('Initializing Google OAuth strategy');
  passport.use(
    new GoogleStrategy(
      {
        clientID: oauthConfig.google.clientId,
        clientSecret: oauthConfig.google.clientSecret,
        callbackURL: oauthConfig.google.callbackURL,
        scope: oauthConfig.google.scope,
      },
      (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void,
      ) => {
        // Passport will add the profile to req.user
        return done(null, profile);
      },
    ),
  );
}

// Facebook Strategy
if (oauthConfig.facebook.enabled) {
  LOGGER.info('Initializing Facebook OAuth strategy');
  passport.use(
    new FacebookStrategy(
      {
        clientID: oauthConfig.facebook.clientId,
        clientSecret: oauthConfig.facebook.clientSecret,
        callbackURL: oauthConfig.facebook.callbackURL,
        profileFields: ['id', 'displayName', 'photos', 'email'],
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      },
    ),
  );
}

// GitHub Strategy
if (oauthConfig.github.enabled) {
  LOGGER.info('Initializing GitHub OAuth strategy');
  passport.use(
    new GitHubStrategy(
      {
        clientID: oauthConfig.github.clientId,
        clientSecret: oauthConfig.github.clientSecret,
        callbackURL: oauthConfig.github.callbackURL,
        scope: oauthConfig.github.scope,
      },
      (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void,
      ) => {
        return done(null, profile);
      },
    ),
  );
}

// Serialization (not needed for JWT, but required for Passport)
passport.serializeUser((user: any, done: (error: any, id?: any) => void) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done: (error: any, user?: any) => void) => {
  done(null, obj);
});

export { passport };
