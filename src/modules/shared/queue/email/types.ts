import { Job, JobId, JobOptions, JobStatus } from 'bull';

export interface IEmailJobData {
  to: string;
  template: EmailTemplate;
  data: Record<string, any>;
  metadata?: {
    userId?: string;
    priority?: number;
    category?: string;
    timestamp?: number;
    version?: string;
  };
}

export interface IEmailJobResult {
  success: boolean;
  messageId?: string;
  error?: Error;
  timestamp: number;
}

export type JobState = JobStatus | 'stuck';

export type IEmailJob = Job<IEmailJobData>;

export interface IEmailJobStatus {
  id: JobId;
  state: JobState;
  progress: number;
  attempts: number;
  failedReason?: string;
  processedOn?: number;
  finishedOn?: number;
  data: IEmailJobData;
}

export interface ITemplateConfig {
  path: string;
  requiredData: string[];
  description: string;
}

export enum EmailTemplate {
  ACCOUNT_CREATION = 'account-creation',
  PASSWORD_RESET = 'password-reset',
  EMAIL_VERIFICATION = 'email-verification',
  OTP_LOGIN = 'otp-login',
  OTP_RESET_PASSWORD = 'otp-reset-password',
  OTP_VERIFY_ACCOUNT = 'otp-verify-account',
  ACCOUNT_VERIFIED = 'account-verified',
  PASSWORD_RESET_CONFIRMATION = 'password-reset-confirmation',
}

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
  [EmailTemplate.ACCOUNT_VERIFIED]: {
    path: 'account-verified',
    requiredData: ['name', 'appName'],
    description: 'Email sent when account is successfully verified',
  },
  [EmailTemplate.PASSWORD_RESET_CONFIRMATION]: {
    path: 'password-reset-confirmation',
    requiredData: ['name', 'appName'],
    description: 'Email sent when password is successfully reset',
  },
};

export enum EmailJobPriority {
  LOW = 10,
  NORMAL = 0,
  HIGH = -10,
  CRITICAL = -20,
}

export interface IEmailQueueService {
  addToQueue(options: IAddToQueueOptions): Promise<IQueueResponse<string>>;
  getJobStatus(jobId: string): Promise<IQueueResponse<IEmailJobStatus>>;
  removeJob(jobId: string): Promise<IQueueResponse<void>>;
  getQueueMetrics(): Promise<IQueueMetrics>;
}

export interface IAddToQueueOptions {
  to: string;
  template: EmailTemplate;
  data: Record<string, any>;
  priority?: EmailJobPriority;
  metadata?: {
    userId?: string;
    category?: string;
  };
}

export interface IQueueResponse<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

export interface IQueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

export interface IEmailQueueOptions extends JobOptions {
  priority?: EmailJobPriority;
}
