import { Gender, UserProjectStatus, UserRole, UserStatus } from '@/connstant/enum/common';
import { assignBaseUrl, sendGet, sendPatch } from '../axios';

export const getListUserInSystem = (params?: IParamsGetListUserInSystem): Promise<IResponseGetListUserInSystem> =>
  sendGet(assignBaseUrl('admin/list-user'), params);

export const getListProjectInSystem = (
  params?: IParamsGetListProjectInSystem,
): Promise<IResponseGetListProjectInSystem> => sendGet(assignBaseUrl('admin/list-project'), params);

export const updateUserInSystem = (userId: number, payload: IPayloadUpdateUserInSystem) =>
  sendPatch(assignBaseUrl(`admin/edit-user/${userId}`), payload);

export interface IParamsGetListUserInSystem {
  skip?: number;
  take?: number;
  pageSize?: number;
  pageIndex?: number;
  keyword?: string;
}

export interface IParamsGetListProjectInSystem {
  skip?: number;
  take?: number;
  pageSize?: number;
  pageIndex?: number;
  keyword?: string;
}

export interface IPayloadUpdateUserInSystem {
  status: UserStatus;
}

export interface IResponseGetListUserInSystemData {
  id?: number;
  name?: string;
  avatar?: string;
  gender?: Gender;
  address?: string;
  birthday?: string;
  email?: string;
  status?: UserStatus;
  role?: UserRole;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
  avatar50x50?: string;
  avatar400x400?: string;
  origin?: string;
}

export interface IResponseGetListProjectInSystemData {
  id?: number;
  memberCount?: number;
  name?: string;
  key?: string;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IResponseGetListUserInSystem {
  hasMore?: boolean;
  pageIndex?: number;
  totalPages?: number;
  totalItems?: number;
  data?: IResponseGetListUserInSystemData[];
}

export interface IResponseGetListProjectInSystem {
  hasMore?: boolean;
  pageIndex?: number;
  totalPages?: number;
  totalItems?: number;
  data?: IResponseGetListProjectInSystemData[];
}
