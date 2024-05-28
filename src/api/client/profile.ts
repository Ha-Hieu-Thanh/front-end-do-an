import { Gender } from '@/connstant/enum/common';
import { assignBaseUrlClient, sendGet, sendPatch } from '../axios';

export const getMyProfile = (): Promise<IMyProfileClient> => sendGet(assignBaseUrlClient('profile/my-profile'));
export const updateMyProfile = (params: IUpdateMyProfile) => sendPatch(assignBaseUrlClient('profile/update'), params);

export interface IUpdateMyProfile {
  avatar?: string;
  name?: string;
  phone?: string;
  gender?: Gender;
  address?: string;
  birthday?: string;
}
export interface IMyProfileClient {
  id: number;
  lastCompanyId: number;
  name: string;
  gender: Gender;
  address: string;
  birthday: string;
  email: string;
  phone: string;
  avatar: string;
  avatar50x50: string;
  avatar400x400: string;
  origin: string;
}
