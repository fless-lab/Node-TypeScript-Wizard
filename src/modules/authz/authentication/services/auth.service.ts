import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { AuthenticationStrategies } from 'modules/authz/authentication/strategies';
import { OTPService, UserService } from 'modules/features/actions';
import { IOTPModel } from 'modules/features/actions/otp/types';
import { IUserModel } from 'modules/features/actions/user/types';
import EmailQueueService from 'modules/shared/queue/email/email.queue.service';
import { EmailTemplate } from 'modules/shared/queue/email/types';

class AuthService {
  async register(payload: any) {
    try {
      const { email } = payload;

      const userResponse = await UserService.exists({ email });

      if (userResponse === true) {
        throw new ErrorResponse({
          code: 'UNIQUE_FIELD_ERROR',
          message: 'The entered email is already registered.',
          statusCode: 409,
        });
      }

      const createUserResponse = (await UserService.create(payload)) as any;

      if (!createUserResponse.success) {
        throw createUserResponse.error;
      }

      const otpResponse = (await OTPService.generate(
        email,
        CONFIG.otp.purposes.ACCOUNT_VERIFICATION.code,
      )) as any;

      if (!otpResponse.success) {
        throw otpResponse.error;
      }

      const createdUser = createUserResponse.data.docs;
      const otp = otpResponse.data;

      const mailData = {
        name: `${createdUser.firstname} ${createdUser.lastname}`,
        email: email,
        code: otp.code,
      };

      const mailResponse = await EmailQueueService.addToQueue({
        to: email,
        template: EmailTemplate.ACCOUNT_CREATION,
        data: mailData,
      });

      if (!mailResponse.success) {
        LOGGER.error('Failed to queue verification email', mailResponse.error);
        throw new ErrorResponse({
          code: 'EMAIL_QUEUE_ERROR',
          message:
            'Failed to queue verification email. Please try again later.',
          statusCode: 500,
          originalError: mailResponse.error,
        });
      }

      return {
        success: true,
        data: {
          user: createUserResponse.data.docs,
          otp: otpResponse.document,
        },
      };
    } catch (error) {
      LOGGER.error('Registration process failed', error);
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred during registration.',
                statusCode: 500,
                originalError: error as Error,
              }),
      };
    }
  }

  async verifyAccount(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { email, code } = payload;
      const userResponse = (await UserService.findOne({
        email,
      })) as any;

      if (!userResponse.success || !userResponse.data?.docs) {
        throw new ErrorResponse({
          code: 'NOT_FOUND_ERROR',
          message: 'User not found.',
          statusCode: 408,
        });
      }

      if (userResponse.data.docs.verified) {
        return { success: true }; // If already verified, return success without further actions
      }

      const validateOtpResponse = await OTPService.validate(
        email,
        code,
        CONFIG.otp.purposes.ACCOUNT_VERIFICATION.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      const verifyUserResponse = await UserService.markAsVerified(email);

      if (!verifyUserResponse.success) {
        throw verifyUserResponse.error;
      }

      // Envoi du mail de confirmation après vérification
      const user = userResponse.data.docs;
      const mailData = {
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        appName: CONFIG.app,
      };
      await EmailQueueService.addToQueue({
        to: user.email,
        template: EmailTemplate.ACCOUNT_VERIFIED,
        data: mailData,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: (error as Error).message,
                statusCode: 500,
              }),
      };
    }
  }

  async generateLoginOtp(
    payload: any,
  ): Promise<SuccessResponseType<IOTPModel> | ErrorResponseType> {
    try {
      const { email } = payload;
      const userResponse = (await UserService.findOne({
        email,
      })) as any;

      if (!userResponse.success || !userResponse.data?.docs) {
        throw new ErrorResponse({
          code: 'NOT_FOUND_ERROR',
          message: 'User not found.',
          statusCode: 404,
        });
      }

      const user = userResponse.data.docs;

      if (!user.verified) {
        throw new ErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'Unverified account.',
          statusCode: 401,
        });
      }

      if (!user.active) {
        throw new ErrorResponse({
          code: 'FORBIDDEN',
          message: 'Inactive account, please contact admins.',
          statusCode: 403,
        });
      }

      const otpResponse = (await OTPService.generate(
        email,
        CONFIG.otp.purposes.LOGIN_CONFIRMATION.code,
      )) as any;

      if (!otpResponse.success) {
        throw otpResponse.error;
      }

      const mailData = {
        name: `${user.firstname} ${user.lastname}`,
        email: email,
        code: otpResponse.data?.code,
      };

      const mailResponse = await EmailQueueService.addToQueue({
        to: email,
        template: EmailTemplate.OTP_LOGIN,
        data: mailData,
      });

      if (!mailResponse.success) {
        LOGGER.error('Failed to queue verification email', mailResponse.error);
        throw new ErrorResponse({
          code: 'EMAIL_QUEUE_ERROR',
          message:
            'Failed to queue generate login otp. Please try again later.',
          statusCode: 500,
          originalError: mailResponse.error,
        });
      }

      return { success: true, data: otpResponse };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: (error as Error).message,
                statusCode: 500,
              }),
      };
    }
  }

  async loginWithPassword(payload: any) {
    try {
      const { email, password } = payload;
      const userResponse = await UserService.findOne({
        email,
      });

      if (!userResponse.success) {
        throw userResponse.error;
      }

      const user = userResponse.data?.docs as unknown as IUserModel;
      const isValidPasswordResponse = await UserService.isvalidPassword(
        user.id,
        password,
      );

      const isValid = isValidPasswordResponse?.data?.valid;

      if (!isValid) {
        throw new ErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials.',
          statusCode: 401,
        });
      }

      if (!user.verified) {
        throw new ErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'Unverified account.',
          statusCode: 401,
        });
      }

      if (!user.active) {
        throw new ErrorResponse({
          code: 'FORBIDDEN',
          message: 'Inactive account, please contact admins.',
          statusCode: 403,
        });
      }

      const accessToken = await AuthenticationStrategies.jwt.signAccessToken(
        user.id,
      );
      const refreshToken = await AuthenticationStrategies.jwt.signRefreshToken(
        user.id,
      );

      return {
        success: true,
        data: {
          token: { access: accessToken, refresh: refreshToken },
          user,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: (error as Error).message,
                statusCode: 500,
              }),
      };
    }
  }

  async loginWithOtp(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { email, code } = payload;
      const userResponse = (await UserService.findOne({
        email,
      })) as any;

      if (!userResponse.success || !userResponse.data?.docs) {
        throw new ErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials.',
          statusCode: 401,
        });
      }

      const user = userResponse.data.docs;

      const validateOtpResponse = await OTPService.validate(
        email,
        code,
        CONFIG.otp.purposes.LOGIN_CONFIRMATION.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      if (!user.verified) {
        throw new ErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'Unverified account.',
          statusCode: 401,
        });
      }

      if (!user.active) {
        throw new ErrorResponse({
          code: 'FORBIDDEN',
          message: 'Inactive account, please contact admins.',
          statusCode: 403,
        });
      }

      const accessToken = await AuthenticationStrategies.jwt.signAccessToken(
        user.id,
      );
      const refreshToken = await AuthenticationStrategies.jwt.signRefreshToken(
        user.id,
      );

      return {
        success: true,
        data: {
          token: { access: accessToken, refresh: refreshToken },
          user,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: (error as Error).message,
                statusCode: 500,
              }),
      };
    }
  }

  async refresh(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { refreshToken } = payload;
      if (!refreshToken) {
        throw new ErrorResponse({
          code: 'BAD_REQUEST',
          message: 'Refresh token is required.',
          statusCode: 400,
        });
      }

      const userId =
        await AuthenticationStrategies.jwt.verifyRefreshToken(refreshToken);
      const accessToken =
        await AuthenticationStrategies.jwt.signAccessToken(userId);
      // Refresh token change to ensure rotation
      const newRefreshToken =
        await AuthenticationStrategies.jwt.signRefreshToken(userId);

      return {
        success: true,
        data: { token: { access: accessToken, refresh: newRefreshToken } },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: (error as Error).message,
                statusCode: 500,
              }),
      };
    }
  }

  async logout(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { accessToken, refreshToken } = payload;

      if (!refreshToken || !accessToken) {
        throw new ErrorResponse({
          code: 'BAD_REQUEST',
          message: 'Refresh and access token are required.',
          statusCode: 400,
        });
      }

      const { userId: userIdFromRefresh } =
        await AuthenticationStrategies.jwt.checkRefreshToken(refreshToken);
      const { userId: userIdFromAccess } =
        await AuthenticationStrategies.jwt.checkAccessToken(accessToken);

      if (userIdFromRefresh !== userIdFromAccess) {
        throw new ErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'Access token does not match refresh token.',
          statusCode: 401,
        });
      }

      // Blacklist the access token
      await AuthenticationStrategies.jwt.blacklistToken(accessToken);

      // Remove the refresh token from Redis
      await AuthenticationStrategies.jwt.removeFromRedis(userIdFromRefresh);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: (error as Error).message,
                statusCode: 500,
              }),
      };
    }
  }

  async forgotPassword(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { email } = payload;
      if (!email) {
        throw new ErrorResponse({
          code: 'BAD_REQUEST',
          message: 'Email should be provided.',
          statusCode: 400,
        });
      }

      const userResponse = (await UserService.findOne({
        email,
      })) as any;

      if (!userResponse.success || !userResponse.data?.docs) {
        throw new ErrorResponse({
          code: 'NOT_FOUND_ERROR',
          message: 'User not found.',
          statusCode: 404,
        });
      }

      const user = userResponse.data.docs;

      if (!user.verified) {
        throw new ErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'Unverified account.',
        });
      }

      if (!user.active) {
        throw new ErrorResponse({
          code: 'FORBIDDEN',
          message: 'Inactive account, please contact admins.',
          statusCode: 403,
        });
      }

      const otpResponse = await OTPService.generate(
        email,
        CONFIG.otp.purposes.FORGOT_PASSWORD.code,
      );

      if (!otpResponse.success) {
        throw otpResponse.error;
      }

      const otp = otpResponse.data;

      const mailData = {
        name: `${user.firstname} ${user.lastname}`,
        email: email,
        code: otp?.code,
      };

      const mailResponse = await EmailQueueService.addToQueue({
        to: email,
        template: EmailTemplate.OTP_RESET_PASSWORD,
        data: mailData,
      });

      if (!mailResponse.success) {
        LOGGER.error('Failed to queue verification email', mailResponse.error);
        throw new ErrorResponse({
          code: 'EMAIL_QUEUE_ERROR',
          message:
            'Failed to queue verification email. Please try again later.',
          statusCode: 500,
          originalError: mailResponse.error,
        });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: (error as Error).message,
                statusCode: 500,
              }),
      };
    }
  }

  async resetPassword(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      // We suppose a verification about new password and confirmation password have already been done
      const { email, code, newPassword } = payload;
      const userResponse = (await UserService.findOne({
        email,
      })) as any;

      if (!userResponse.success || !userResponse.data?.docs) {
        throw new ErrorResponse({
          code: 'NOT_FOUND_ERROR',
          message: 'User not found.',
          statusCode: 404,
        });
      }

      const user = userResponse.data.docs;

      if (!user.verified) {
        throw new ErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'Unverified account.',
          statusCode: 401,
        });
      }

      if (!user.active) {
        throw new ErrorResponse({
          code: 'FORBIDDEN',
          message: 'Inactive account, please contact admins.',
          statusCode: 403,
        });
      }

      const validateOtpResponse = await OTPService.validate(
        email,
        code,
        CONFIG.otp.purposes.FORGOT_PASSWORD.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      const updatePasswordResponse = await UserService.updatePassword(
        user.id,
        newPassword,
      );

      if (!updatePasswordResponse.success) {
        throw updatePasswordResponse.error;
      }

      // Send confirmation email
      const mailData = {
        name: `${user.firstname} ${user.lastname}`,
        appName: CONFIG.app,
      };

      const mailResponse = await EmailQueueService.addToQueue({
        to: email,
        template: EmailTemplate.PASSWORD_RESET_CONFIRMATION,
        data: mailData,
      });

      if (!mailResponse.success) {
        LOGGER.error(
          'Failed to queue password reset confirmation email',
          mailResponse.error,
        );
        // We don't throw an error here as the password was successfully reset
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: (error as Error).message,
                statusCode: 500,
              }),
      };
    }
  }

  async getCurrentUser(
    userId: string,
  ): Promise<SuccessResponseType<IUserModel> | ErrorResponseType> {
    try {
      const userResponse = await UserService.findById(userId);

      if (!userResponse.success || !userResponse.data?.docs) {
        throw new ErrorResponse({
          code: 'NOT_FOUND_ERROR',
          message: 'User not found.',
          statusCode: 404,
        });
      }

      return {
        success: true,
        data: userResponse.data.docs,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: (error as Error).message,
                statusCode: 500,
              }),
      };
    }
  }
}

export default new AuthService();
