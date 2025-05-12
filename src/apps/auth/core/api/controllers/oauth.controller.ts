import {
  ApiResponse,
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { Request, Response } from 'express';
import { oauthService } from 'modules/authz/authentication/services/oauth.service';

class OAuthController {
  /**
   * Get all enabled OAuth providers
   */
  static async getEnabledProviders(req: Request, res: Response) {
    try {
      const providers = oauthService.getEnabledProviders();
      const providersWithConfig = providers.map((provider) => ({
        provider,
        name: provider.charAt(0).toUpperCase() + provider.slice(1),
        scope: oauthService.getProviderConfig(provider).scope,
      }));

      ApiResponse.success(res, {
        success: true,
        data: {
          providers: providersWithConfig,
        },
      } as SuccessResponseType<any>);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }
  /**
   * Initiate OAuth login with Google
   */
  static async googleLogin(req: Request, res: Response) {
    try {
      if (!oauthService.isProviderEnabled('google')) {
        throw new ErrorResponse({
          code: 'PROVIDER_DISABLED',
          message: 'Google authentication is not enabled.',
          statusCode: 400,
        });
      }

      // The actual authentication will be handled by Passport.js middleware
      // This is just a placeholder for the route
      res.status(200).json({ message: 'Redirecting to Google...' });
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Handle Google OAuth callback
   */
  static async googleCallback(req: Request, res: Response) {
    try {
      const response = await oauthService.handleOAuthCallback(
        'google',
        req.user,
      );
      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Initiate OAuth login with Facebook
   */
  static async facebookLogin(req: Request, res: Response) {
    try {
      if (!oauthService.isProviderEnabled('facebook')) {
        throw new ErrorResponse({
          code: 'PROVIDER_DISABLED',
          message: 'Facebook authentication is not enabled.',
          statusCode: 400,
        });
      }

      // The actual authentication will be handled by Passport.js middleware
      // This is just a placeholder for the route
      res.status(200).json({ message: 'Redirecting to Facebook...' });
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Handle Facebook OAuth callback
   */
  static async facebookCallback(req: Request, res: Response) {
    try {
      const response = await oauthService.handleOAuthCallback(
        'facebook',
        req.user,
      );
      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Initiate OAuth login with GitHub
   */
  static async githubLogin(req: Request, res: Response) {
    try {
      if (!oauthService.isProviderEnabled('github')) {
        throw new ErrorResponse({
          code: 'PROVIDER_DISABLED',
          message: 'GitHub authentication is not enabled.',
          statusCode: 400,
        });
      }

      // The actual authentication will be handled by Passport.js middleware
      // This is just a placeholder for the route
      res.status(200).json({ message: 'Redirecting to GitHub...' });
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Handle GitHub OAuth callback
   */
  static async githubCallback(req: Request, res: Response) {
    try {
      const response = await oauthService.handleOAuthCallback(
        'github',
        req.user,
      );
      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }
}

export default OAuthController;
