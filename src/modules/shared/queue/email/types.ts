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

export enum EmailTemplate {
  ACCOUNT_CREATION = 'account-creation',
  PASSWORD_RESET = 'password-reset',
  EMAIL_VERIFICATION = 'email-verification',
  OTP = 'otp',
  WELCOME = 'welcome',
}

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
