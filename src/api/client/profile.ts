import { Gender, UserRole } from '@/connstant/enum/common';
import { assignBaseUrl, sendGet, sendPatch } from '../axios';

export const getMyProfile = (): Promise<IMyProfileClient> => sendGet(assignBaseUrl('profile/my-profile'));
export const updateMyProfile = (params: IUpdateMyProfile) => sendPatch(assignBaseUrl('profile/update'), params);

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
  name: string;
  gender: Gender;
  address: string;
  birthday: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  avatar50x50: string;
  avatar400x400: string;
  origin: string;
}
