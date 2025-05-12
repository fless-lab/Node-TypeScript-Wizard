import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { AuthenticationStrategies } from '../strategies';
import { UserService } from 'modules/features/actions';
import {
  IOAuthProvider,
  IUserModel,
} from 'modules/features/actions/user/types';
import { getOAuthConfig } from 'core/config/oauth.config';
import { ConfigService } from 'core/config';
import { Types } from 'mongoose';

// Type pour les fournisseurs supportés
export type OAuthProviderType = 'google' | 'facebook' | 'github';

class OAuthService {
  private config = getOAuthConfig(ConfigService.getInstance().getConfig());
  private allowAutoRegistration =
    process.env.OAUTH_ALLOW_AUTO_REGISTRATION === 'true';

  /**
   * Returns a list of all enabled OAuth providers
   */
  getEnabledProviders(): OAuthProviderType[] {
    return Object.entries(this.config)
      .filter(([_, config]) => config.enabled)
      .map(([provider]) => provider as OAuthProviderType);
  }

  /**
   * Get configuration for a specific provider
   */
  getProviderConfig(provider: OAuthProviderType) {
    return this.config[provider];
  }

  async handleOAuthCallback(
    provider: OAuthProviderType,
    profile: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      if (!this.config[provider].enabled) {
        throw new ErrorResponse({
          code: 'PROVIDER_DISABLED',
          message: `${provider} authentication is not enabled.`,
          statusCode: 400,
        });
      }

      const email = profile.emails?.[0]?.value;
      if (!email) {
        throw new ErrorResponse({
          code: 'EMAIL_REQUIRED',
          message: 'Email is required for authentication.',
          statusCode: 400,
        });
      }

      // Check if user exists
      const userResponse = await UserService.findOne({ email });
      let user = userResponse.success
        ? (userResponse.data?.docs as IUserModel)
        : null;

      if (!user) {
        // Check if auto-registration is allowed
        if (!this.allowAutoRegistration) {
          throw new ErrorResponse({
            code: 'ACCOUNT_NOT_FOUND',
            message: `No account found with email ${email}. Auto-registration is disabled.`,
            statusCode: 404,
          });
        }

        // Create new user
        const [firstname, ...lastnameParts] = (profile.displayName || '').split(
          ' ',
        );
        const lastname = lastnameParts.join(' ') || 'User';

        LOGGER.info(`Creating new user via OAuth: ${email}`);
        const createUserResponse = await UserService.create({
          email,
          firstname,
          lastname,
          verified: true, // OAuth users are pre-verified
          active: true,
          oauthProviders: [
            {
              providerId: profile.id,
              provider,
              email,
              name: profile.displayName,
              picture: profile.photos?.[0]?.value,
            },
          ],
        });

        if (!createUserResponse.success) {
          throw createUserResponse.error;
        }

        user = createUserResponse.data?.docs as IUserModel;
      } else {
        // Check if provider is already linked
        const existingProvider = user.oauthProviders?.find(
          (p: IOAuthProvider) =>
            p.provider === provider && p.providerId === profile.id,
        );

        if (!existingProvider) {
          // Link new provider
          const newProvider: IOAuthProvider = {
            providerId: profile.id,
            provider,
            email,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
          };

          const userId = user._id as Types.ObjectId;
          const updateResponse = await UserService.updateById(
            userId.toString(),
            {
              $push: { oauthProviders: newProvider },
            },
          );

          if (!updateResponse.success) {
            throw updateResponse.error;
          }

          user = updateResponse.data?.docs as IUserModel;
        }
      }

      if (!user.active) {
        throw new ErrorResponse({
          code: 'FORBIDDEN',
          message: 'Inactive account, please contact admins.',
          statusCode: 403,
        });
      }

      // Generate tokens
      const userId = user._id as Types.ObjectId;
      const accessToken = await AuthenticationStrategies.jwt.signAccessToken(
        userId.toString(),
      );
      const refreshToken = await AuthenticationStrategies.jwt.signRefreshToken(
        userId.toString(),
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

  isProviderEnabled(provider: OAuthProviderType): boolean {
    return this.config[provider].enabled;
  }
}

export const oauthService = new OAuthService();
