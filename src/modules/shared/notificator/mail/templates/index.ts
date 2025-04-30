import { EmailTemplate, ITemplateConfig } from '../../../queue/email/types';

export const templateConfigs: Record<EmailTemplate, ITemplateConfig> = {
  [EmailTemplate.ACCOUNT_CREATION]: {
    path: 'account-creation',
    requiredData: ['name', 'email', 'code'],
    description: 'Email sent when a new account is created',
  },
  [EmailTemplate.PASSWORD_RESET]: {
    path: 'password-reset',
    requiredData: ['name', 'code'],
    description: 'Email sent for password reset requests',
  },
  [EmailTemplate.EMAIL_VERIFICATION]: {
    path: 'email-verification',
    requiredData: ['name', 'code'],
    description: 'Email sent to verify email address',
  },
  [EmailTemplate.OTP_LOGIN]: {
    path: 'otp-login',
    requiredData: ['name', 'code'],
    description: 'Email sent with OTP code for login',
  },
  [EmailTemplate.OTP_RESET_PASSWORD]: {
    path: 'otp-reset-password',
    requiredData: ['name', 'code'],
    description: 'Email sent with OTP code for password reset',
  },
  [EmailTemplate.OTP_VERIFY_ACCOUNT]: {
    path: 'otp-verify-account',
    requiredData: ['name', 'code'],
    description: 'Email sent with OTP code for account verification',
  },
  [EmailTemplate.WELCOME]: {
    path: 'welcome',
    requiredData: ['name'],
    description: 'Welcome email sent after account verification',
  },
};
