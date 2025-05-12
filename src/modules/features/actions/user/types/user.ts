import { IBaseModel } from '@nodesandbox/repo-framework';

export interface IOAuthProvider {
  providerId: string;
  provider: 'google' | 'facebook' | 'github';
  email: string;
  name?: string;
  picture?: string;
}

export interface IUser {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  verified: boolean;
  active: boolean;
  oauthProviders?: IOAuthProvider[];
}

export interface IUserModel extends IUser, IBaseModel, Document {}
