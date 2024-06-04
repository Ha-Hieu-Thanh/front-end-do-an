import { ClientLoginType } from '@/connstant/enum/common';
import { assignBaseUrl, sendPost } from '../axios';

export const clientLogin = (payload: IClientLogin): Promise<IClientLoginResponse> =>
  sendPost(assignBaseUrl('auth/login'), payload);
export const clientRegister = (payload: IClientRegister): Promise<any> =>
  sendPost(assignBaseUrl('auth/register'), payload);
export const clientForgotPassword = (payload: IClientForgotPassword): Promise<any> =>
  sendPost(assignBaseUrl('auth/forgot-password'), payload);
export const clientConfirmForgotPassword = (payload: IClientConfirmForgotPassword): Promise<any> =>
  sendPost(assignBaseUrl('auth/confirm-forgot-password'), payload);
export const verifyRegister = (payload: IClientVerifyRegister): Promise<any> =>
  sendPost(assignBaseUrl('auth/verify-register'), payload);
export const clientChangePassword = (payload: IClientChangePassword) =>
  sendPost(assignBaseUrl('auth/change-password'), payload);

// export const contact = (payload: IContact) => sendPost(assignBaseUrlCommon('contact'), payload);

export interface IContact {
  name: string;
  email: string;
  title: string;
  content: string;
}

export interface IClientChangePassword {
  password: string;
  newPassword: string;
}

export interface IClientLogin {
  email: string;
  password: string;
  loginType: ClientLoginType;
}
export interface IClientRegister {
  email: string;
  password: string;
}
export interface IClientForgotPassword {
  email: string;
}
export interface IClientConfirmForgotPassword {
  tokenForgotPassword: string;
  newPassword: string;
}
export interface IClientVerifyRegister {
  inviteCode: string;
}
export interface IClientLoginResponse {
  data: {
    token: string;
    refreshToken: string;
  };
}
