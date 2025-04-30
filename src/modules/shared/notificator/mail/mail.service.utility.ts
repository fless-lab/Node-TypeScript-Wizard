import {
  IEmailOptions,
  IEmailResponse,
  EmailError,
  EmailErrorCode,
  OTPPurpose
} from './types';
import { EmailTemplate } from '../../queue/email/types';
import MailService from './mail.service';

class MailServiceUtilities {
  static async sendMail(options: IEmailOptions): Promise<IEmailResponse> {
    try {
      return await MailService.sendMail(options);
    } catch (error) {
      if (error instanceof EmailError) {
        throw error;
      }
      throw new EmailError(
        'Failed to send email',
        EmailErrorCode.PROVIDER_ERROR,
        true,
      );
    }
  }

  static async sendOtp(
    to: string,
    code: string,
    purpose: OTPPurpose,
    name: string,
  ): Promise<void> {
    let template: EmailTemplate;

    switch (purpose) {
      case OTPPurpose.ACCOUNT_VERIFICATION:
        template = EmailTemplate.OTP_VERIFY_ACCOUNT;
        break;
      case OTPPurpose.FORGOT_PASSWORD:
        template = EmailTemplate.OTP_RESET_PASSWORD;
        break;
      case OTPPurpose.LOGIN_CONFIRMATION:
        template = EmailTemplate.OTP_LOGIN;
        break;
      default:
        throw new Error(`Invalid OTP purpose: ${purpose}`);
    }

    await this.sendMail({
      to,
      template,
      data: {
        name,
        code,
      },
    });
  }

  static async sendAccountCreationEmail({
    to,
    data,
  }: {
    to: string;
    data: {
      name: string;
      email: string;
      code: string;
    };
  }): Promise<IEmailResponse> {
    const options = {
      to,
      template: EmailTemplate.ACCOUNT_CREATION,
      data: {
        subject: 'Welcome to Our Service',
        ...data,
        appName: CONFIG.app,
        expiresIn: CONFIG.otp.expiration / 60000,
      },
    };
    return await this.sendMail(options);
  }

  static async sendPasswordResetEmail({
    to,
    data,
  }: {
    to: string;
    data: {
      name: string;
      code: string;
    };
  }): Promise<IEmailResponse> {
    return await this.sendMail({
      to,
      template: EmailTemplate.PASSWORD_RESET,
      data: {
        subject: 'Reset Your Password',
        ...data,
        appName: CONFIG.app,
        expiresIn: CONFIG.otp.expiration / 60000,
      },
    });
  }

  static async sendEmailVerification({
    to,
    data,
  }: {
    to: string;
    data: {
      name: string;
      code: string;
    };
  }): Promise<IEmailResponse> {
    return await this.sendMail({
      to,
      template: EmailTemplate.EMAIL_VERIFICATION,
      data: {
        subject: 'Verify Your Email',
        ...data,
        appName: CONFIG.app,
        expiresIn: CONFIG.otp.expiration / 60000,
      },
    });
  }
}

export default MailServiceUtilities;
