import { Router } from 'express';
import { authenticate } from 'modules/authz/authentication/middlewares';
import { AuthController } from '../controllers';

const router = Router();

/**
 * Route for user registration
 * POST /auth/register
 */
router.post('/register', AuthController.register);

/**
 * Route for account verification
 * POST /auth/verify
 */
router.post('/verify', AuthController.verifyAccount);

/**
 * Route for login with password
 * POST /auth/login
 */
router.post('/login', AuthController.loginWithPassword);

/**
 * Route for generating login OTP
 * POST /auth/login/otp/generate
 */
router.post('/login/otp/generate', AuthController.generateLoginOtp);

/**
 * Route for login with OTP
 * POST /auth/login/otp
 */
router.post('/login/otp', AuthController.loginWithOtp);

/**
 * Route for token refresh
 * POST /auth/refresh
 */
router.post('/refresh', AuthController.refresh);

/**
 * Route for logout
 * POST /auth/logout
 * Requires authentication
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * Route for forgot password
 * POST /auth/forgot-password
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * Route for reset password
 * POST /auth/reset-password
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * Route for reset password
 * POST /auth/otp/generate
 */
router.post('/otp/generate', AuthController.generateOTP);

/**
 * Route for reset password
 * POST /auth/otp/validate
 */
router.post('/otp/validate', AuthController.validateOTP);

/**
 * Route for getting current user information
 * GET /auth/me
 * Requires authentication
 */
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
