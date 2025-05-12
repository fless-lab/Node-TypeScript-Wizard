import { Router } from 'express';
import OAuthController from '../controllers/oauth.controller';
import { passport } from 'core/config/passport.config';

const router = Router();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/oauth/error',
  }),
  OAuthController.googleCallback,
);

// Facebook OAuth routes
router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
  }),
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: '/auth/oauth/error',
  }),
  OAuthController.facebookCallback,
);

// GitHub OAuth routes
router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email'],
  }),
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/auth/oauth/error',
  }),
  OAuthController.githubCallback,
);

// Get enabled OAuth providers
router.get('/providers', OAuthController.getEnabledProviders);

// Error route for OAuth failures
router.get('/error', (req, res) => {
  res.status(400).json({
    success: false,
    error: {
      code: 'OAUTH_ERROR',
      message: 'OAuth authentication failed',
      statusCode: 400,
    },
  });
});

export default router;
