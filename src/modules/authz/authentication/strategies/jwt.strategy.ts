// TODO - Format error responses

import { ApiResponse, ErrorResponse } from '@nodesandbox/response-kit';
import { NextFunction, Request, Response } from 'express';
import JWT, { SignOptions } from 'jsonwebtoken';

class JwtStrategy {
  private static instance: JwtStrategy;
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpireTime: string;
  private refreshTokenExpireTime: string;
  private tokenIssuer: string;
  private redisTokenExpireTime: number;
  private redisBlacklistExpireTime: number;

  private constructor() {
    this.accessTokenSecret = CONFIG.jwt.accessTokenSecret;
    this.refreshTokenSecret = CONFIG.jwt.refreshTokenSecret;
    this.accessTokenExpireTime = CONFIG.jwt.accessTokenExpireTime;
    this.refreshTokenExpireTime = CONFIG.jwt.refreshTokenExpireTime;
    this.tokenIssuer = CONFIG.jwt.tokenIssuer;
    this.redisTokenExpireTime = CONFIG.redis.tokenExpireTime;
    this.redisBlacklistExpireTime = CONFIG.redis.blacklistExpireTime;
  }

  public static getInstance(): JwtStrategy {
    if (!JwtStrategy.instance) {
      JwtStrategy.instance = new JwtStrategy();
    }
    return JwtStrategy.instance;
  }

  public async signAccessToken(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const payload = {};
      const options: SignOptions = {
        expiresIn: this.accessTokenExpireTime as any,
        issuer: this.tokenIssuer,
        audience: userId,
      };

      JWT.sign(
        payload,
        this.accessTokenSecret,
        options,
        (err: any, token?: string) => {
          if (err || !token) {
            LOGGER.error(err?.message, err);
            return reject(
              new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Internal Server Error',
              }),
            );
          }
          resolve(token);
        },
      );
    });
  }

  public async isTokenBlacklisted(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      REDIS.get(`bl_${token}`, (err, result) => {
        if (err) {
          LOGGER.error(err.message, err);
          return reject(
            new ErrorResponse({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Internal Server Error',
            }),
          );
        }
        resolve(result === 'blacklisted');
      });
    });
  }

  public verifyAccessToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (!req.headers['authorization']) {
      return ApiResponse.error(res, {
        success: false,
        error: new ErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
          suggestions: ['No authorization header provided'],
        }),
      }) as any;
    }

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];
    JWT.verify(
      token,
      this.accessTokenSecret,
      async (err: any, payload: any) => {
        if (err) {
          const message =
            err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
          return ApiResponse.error(res, {
            success: false,
            error: new ErrorResponse({ code: 'UNAUTHORIZED', message }),
          });
        }

        try {
          const blacklisted = await this.isTokenBlacklisted(token);
          if (blacklisted) {
            return ApiResponse.error(res, {
              success: false,
              error: new ErrorResponse({
                code: 'FORBIDDEN',
                message: 'Forbidden',
                suggestions: ['Token is blacklisted'],
              }),
            });
          }
        } catch (error) {
          return ApiResponse.error(res, {
            success: false,
            error: error as ErrorResponse,
          });
        }
        //   @ts-ignore: Suppress TS error for non-existent property
        req.payload = payload;
        next();
      },
    );
  }

  public async signRefreshToken(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const payload = {};
      const options: SignOptions = {
        expiresIn: this.refreshTokenExpireTime as any,
        issuer: this.tokenIssuer,
        audience: userId,
      };

      JWT.sign(
        payload,
        this.refreshTokenSecret,
        options,
        (err: any, token?: string) => {
          if (err || !token) {
            LOGGER.error(err?.message, err);
            return reject(
              new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Internal Server Error',
              }),
            );
          }

          REDIS.set(
            userId,
            token,
            'EX',
            this.redisTokenExpireTime,
            (redisErr) => {
              if (redisErr) {
                LOGGER.error(redisErr.message, redisErr);
                return reject(
                  new ErrorResponse({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Internal Server Error',
                  }),
                );
              }
              resolve(token);
            },
          );
        },
      );
    });
  }

  public async verifyRefreshToken(refreshToken: string): Promise<string> {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        this.refreshTokenSecret,
        (err: any, payload: any) => {
          if (err) {
            return reject(
              new ErrorResponse({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
              }),
            );
          }

          const userId = payload?.aud as string;

          REDIS.get(userId, (redisErr, result) => {
            if (redisErr) {
              LOGGER.error(redisErr.message, redisErr);
              return reject(
                new ErrorResponse({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: 'Internal Server Error',
                }),
              );
            }

            if (refreshToken === result) {
              return resolve(userId);
            }

            return reject(
              new ErrorResponse({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
              }),
            );
          });
        },
      );
    });
  }

  public async blacklistToken(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      REDIS.set(
        `bl_${token}`,
        'blacklisted',
        'EX',
        this.redisBlacklistExpireTime,
        (redisErr) => {
          if (redisErr) {
            LOGGER.error(redisErr.message, redisErr);
            return reject(
              new ErrorResponse({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Internal Server Error',
              }),
            );
          }
          resolve();
        },
      );
    });
  }

  public async removeFromRedis(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      REDIS.del(key, (redisErr) => {
        if (redisErr) {
          LOGGER.error(redisErr.message, redisErr);
          return reject(
            new ErrorResponse({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Internal Server Error',
            }),
          );
        }
        resolve();
      });
    });
  }

  public async checkAccessToken(
    accessToken: string,
  ): Promise<{ userId: string }> {
    return new Promise((resolve, reject) => {
      JWT.verify(
        accessToken,
        this.accessTokenSecret,
        (err: any, payload: any) => {
          if (err) {
            const message =
              err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
            return reject(new ErrorResponse({ code: 'UNAUTHORIZED', message }));
          }

          const userId = payload?.aud as string;

          resolve({ userId });
        },
      );
    });
  }

  public async checkRefreshToken(
    refreshToken: string,
  ): Promise<{ userId: string }> {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        this.refreshTokenSecret,
        (err: any, payload: any) => {
          if (err) {
            return reject(
              new ErrorResponse({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
              }),
            );
          }

          const userId = payload?.aud as string;

          REDIS.get(userId, (redisErr, result) => {
            if (redisErr) {
              LOGGER.error(redisErr.message, redisErr);
              return reject(
                new ErrorResponse({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: 'Internal Server Error',
                }),
              );
            }

            if (refreshToken === result) {
              return resolve({ userId });
            }

            return reject(
              new ErrorResponse({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
              }),
            );
          });
        },
      );
    });
  }
}

export default JwtStrategy.getInstance();
