import { ApiResponse, ErrorResponseType } from '@nodesandbox/response-kit';
import { Request, Response } from 'express';
import { sanitize } from 'helpers';
import { AuthService } from 'modules/authz/authentication/services';
import { OTPService } from 'modules/features/actions';
import {
  ForgotPasswordRequestSchema,
  GenerateOtpRequestSchema,
  LoginOtpRequestSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  RegisterRequestSchema,
  ResetPasswordRequestSchema,
  ValidateOTPRequestSchema,
  VerifyAccountRequestSchema,
} from '../dtos/request';

class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, RegisterRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.register(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response, 201);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Verify user account with OTP
   */
  static async verifyAccount(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, VerifyAccountRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.verifyAccount(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response, 202);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Login with password
   */
  static async loginWithPassword(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, LoginRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.loginWithPassword(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Generate OTP for login
   */
  static async generateLoginOtp(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, GenerateOtpRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.generateLoginOtp(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Login with OTP
   */
  static async loginWithOtp(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, LoginOtpRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.loginWithOtp(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Refresh access token
   */
  static async refresh(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, RefreshTokenRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.refresh(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response) {
    try {
      const response = await AuthService.logout(req.body);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, ForgotPasswordRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.forgotPassword(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const _payload = sanitize(req.body, ResetPasswordRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await AuthService.resetPassword(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  static async generateOTP(req: Request, res: Response): Promise<void> {
    try {
      const _payload = sanitize(req.body, GenerateOtpRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }
      const { email, purpose } = _payload.data;

      const response = await OTPService.generate(email, purpose);
      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  static async validateOTP(req: Request, res: Response): Promise<void> {
    try {
      const _payload = sanitize(req.body, ValidateOTPRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const { email, code, purpose } = _payload.data;
      const response = await OTPService.validate(email, code, purpose);
      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(req: Request, res: Response) {
    try {
      // @ts-ignore: Suppress TS error for non-existent property
      const userId = req.payload.aud;

      const response = await AuthService.getCurrentUser(userId);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }
}

export default AuthController;
