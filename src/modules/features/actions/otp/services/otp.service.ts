import { BaseService } from '@nodesandbox/repo-framework';
import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { generateRandomCode } from 'helpers';
import { UserService } from 'modules/features/actions';
import { IUserModel } from '../../user/types';
import { OTPModel } from '../models';
import { OTPRepository } from '../repositories';
import { IOTPModel, TOTPPurpose } from '../types';

class OTPService extends BaseService<IOTPModel, OTPRepository> {
  constructor() {
    const otpRepo = new OTPRepository(OTPModel);
    super(otpRepo);
  }

  async generate(
    email: string,
    purpose: TOTPPurpose,
  ): Promise<SuccessResponseType<IOTPModel> | ErrorResponseType> {
    try {
      const userResponse = await UserService.findOne({ email });
      if (!userResponse.success || !userResponse.data) {
        // TODO: Customize this kind of error to override BaseService generic not found
        throw userResponse.error;
      }

      const user = userResponse.data.docs as unknown as IUserModel;
      await this.repository.invalidateOldCodes(user.id, purpose);

      const otp = await this.repository.create({
        code: generateRandomCode(CONFIG.otp.length),
        expiresAt: new Date(Date.now() + CONFIG.otp.expiration),
        user: user.id,
        purpose,
      });

      return { success: true, data: otp };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: (error as Error).message,
              }),
      };
    }
  }

  async validate(
    email: string,
    code: string,
    purpose: TOTPPurpose,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const userResponse = await UserService.findOne({ email });
      if (!userResponse.success || !userResponse.data) {
        throw new ErrorResponse({
          code: 'NOT_FOUND_ERROR',
          message: 'User not found.',
        });
      }

      const user = userResponse.data.docs as unknown as IUserModel;
      const otpResponse = await this.repository.findValidCodeByUser(
        code,
        user.id,
        purpose,
      );

      const invalidOtpError = new ErrorResponse({
        code: 'UNAUTHORIZED',
        message: 'This OTP code is invalid or has expired.',
      });

      if (!otpResponse) {
        throw invalidOtpError;
      }

      const otp = otpResponse;
      if (await this.isExpired(otp)) {
        throw invalidOtpError;
      }

      await this.repository.markAsUsed(otp.id);

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
              }),
      };
    }
  }

  private async isExpired(otp: IOTPModel): Promise<boolean> {
    return otp.expiresAt ? Date.now() > otp.expiresAt.getTime() : true;
  }
}

export default new OTPService();
