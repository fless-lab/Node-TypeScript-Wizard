import { MailServiceUtilities } from 'modules/shared/notificator';
import path from 'path';
import { IEmailJob, IEmailJobResult } from './types';

export class EmailJobProcessor {
  async process(job: IEmailJob): Promise<IEmailJobResult> {
    const startTime = Date.now();
    const { to, template, data, metadata } = job.data as any;

    try {
      LOGGER.info(`Processing email job ${job.id}`, {
        template,
        to,
        metadata,
        data,
        templatesPath: path.join(process.cwd(), CONFIG.mail.templates.path),
        mailConfig: {
          host: CONFIG.mail.host,
          port: CONFIG.mail.port,
          secure: CONFIG.runningProd && CONFIG.mail.port === 465,
          user: CONFIG.mail.user ? '***' : undefined,
        },
      });

      await job.progress(10);

      try {
        const result = await MailServiceUtilities.sendMail({
          to,
          template,
          data,
        });
        await job.progress(100);

        if (!result.success) {
          LOGGER.error(`Email sending failed for job ${job.id}`, {
            error: result.error,
            template,
            to,
            data,
          });
          throw result.error;
        }

        const processingTime = Date.now() - startTime;
        LOGGER.info(`Email sent successfully for job ${job.id}`, {
          processingTime,
          template,
          metadata,
          messageId: result.messageId,
        });

        return {
          success: true,
          messageId: result.messageId,
          timestamp: Date.now(),
        };
      } catch (sendError) {
        LOGGER.error(`Mail service error for job ${job.id}`, {
          error:
            sendError instanceof Error
              ? {
                  name: sendError.name,
                  message: sendError.message,
                  stack: sendError.stack,
                }
              : sendError,
          template,
          data,
        });
        throw sendError;
      }
    } catch (error) {
      const processingTime = Date.now() - startTime;

      const errorDetails =
        error instanceof Error
          ? {
              stack: error.stack,
              ...error,
            }
          : error;

      LOGGER.error(`Failed to process email job ${job.id}`, {
        error: errorDetails,
        processingTime,
        template,
        metadata,
        data,
      });

      LOGGER.file('EMAIL_JOB_PROCESSING_ERROR', {
        error: errorDetails,
        processingTime,
        template,
        metadata,
        data,
        config: {
          templatesPath: path.join(process.cwd(), CONFIG.mail.templates.path),
          mailConfig: {
            host: CONFIG.mail.host,
            port: CONFIG.mail.port,
            secure: CONFIG.runningProd && CONFIG.mail.port === 465,
            user: CONFIG.mail.user ? '***' : undefined,
          },
        },
      });

      throw error;
    }
  }
}
