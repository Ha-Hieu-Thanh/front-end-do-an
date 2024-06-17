import {
  CommonStatus,
  IFilterStaff,
  Priority,
  ProjectIssueCategoryStatus,
  ProjectIssueTypeStatus,
  ProjectVersionStatus,
  UserProjectRole,
  UserProjectStatus,
} from '@/connstant/enum/common';
import { assignBaseUrl, sendGet, sendPatch, sendPost, sendPut } from '../axios';

export const getMyProjects = (params?: IParamsGetMyProjects) =>
  sendGet(assignBaseUrl('project/get-my-projects'), params);

export const createMyProjects = (payload: IPayloadCreateMyProjects) =>
  sendPost(assignBaseUrl('project/create'), payload);

export const generateKey = (payload: { name?: string }) => sendPost(assignBaseUrl('project/generate-key'), payload);

export const confirmJoinProject = (payload: { status: UserProjectStatus; projectId: number }) =>
  sendPatch(assignBaseUrl('project/confirm-request-join-project'), payload);

export const getProjectDetail = () => sendGet(assignBaseUrl('project/detail'));

export const updateMyProjects = (payload: IPayloadUpdateMyProjects) =>
  sendPatch(assignBaseUrl('project/update'), payload);

export const addMemberProject = (payload: IAddMemberProject) => sendPost(assignBaseUrl('project/member/add'), payload);

export const membersProject = (params: IFilterStaff) => sendGet(assignBaseUrl('project/member/list'), params);

export const projectIssueCategory = (params: IFilterStaff) =>
  sendGet(assignBaseUrl('project/issue-category/list'), params);

export const projectIssueState = (params: IFilterStaff) => sendGet(assignBaseUrl('project/issue-state/list'), params);

export const projectIssueTypes = (params?: any) => sendGet(assignBaseUrl('project/issue-type/list'), params);

export const projectVersion = (params: IFilterStaff) => sendGet(assignBaseUrl('project/version/list'), params);

export const addProjectIssue = (payload: IAddProjectIssue) => sendPost(assignBaseUrl('project/issue/create'), payload);

export const getProjectIssueHistory = (params?: IParamsProjectIssueHistory) =>
  sendGet(assignBaseUrl('project/issue/history'), params);

export const updateIssueType = (payload: IPayloadUpdateIssueType) =>
  sendPatch(assignBaseUrl('project/issue-type/update'), payload);

export const addIssueType = (payload: IAddIssueType) => sendPost(assignBaseUrl('project/issue-type/create'), payload);

export const updateIssueState = (payload: IPayloadUpdateIssueState) =>
  sendPatch(assignBaseUrl('project/issue-state/update'), payload);

export const addIssueState = (payload: IAddIssueState) =>
  sendPost(assignBaseUrl('project/issue-state/create'), payload);

export const projectIssueCategories = (params?: any) => sendGet(assignBaseUrl('project/issue-category/list'), params);

export const addIssueCategory = (payload: IAddIssueCategory) =>
  sendPost(assignBaseUrl('project/issue-category/create'), payload);

export const updateIssueCategories = (payload: IPayloadUpdateIssueCategory) =>
  sendPatch(assignBaseUrl('project/issue-category/update'), payload);

export const projectIssueVersion = (params?: any) => sendGet(assignBaseUrl('project/version/list'), params);

export const addIssueVersion = (payload: IAddIssueVersion) =>
  sendPost(assignBaseUrl('project/version/create'), payload);

export const updateIssueVersion = (payload: IPayloadUpdateIssueCategory) =>
  sendPatch(assignBaseUrl('project/version/update'), payload);

export const projectIssueList = (params: IFilterIssue) => sendGet(assignBaseUrl('project/issue/list'), params);
export const projectUpdateIssue = (issueId: number, payload: IUpdateIssue) =>
  sendPatch(assignBaseUrl(`project/issue/update/${issueId}`), payload);

export const getIssueDetail = (issueId: number): Promise<{ data: issueDetail }> =>
  sendGet(assignBaseUrl(`project/issue/detail/${issueId}`));

export const updateIssue = (issueId: number, payload: IPayloadUpdateIssue) =>
  sendPatch(assignBaseUrl(`project/issue/update/${issueId}`), payload);

export const updateStaff = (payload: IUpdateStaff) => sendPatch(assignBaseUrl(`project/member/update`), payload);

export const getListWikiProject = (params: IListWikiProject) => sendGet(assignBaseUrl('project/wiki/list'), params);

export const addWikiProject = (payload: IAddWikiProject) => sendPost(assignBaseUrl('project/wiki/create'), payload);

export const updateWikiProject = (wikiId: number, payload: IAddWikiProject) =>
  sendPut(assignBaseUrl(`project/wiki/update/${wikiId}`), payload);

export const getListNotification = (params?: IParamsListNotification) =>
  sendGet(assignBaseUrl('app/list-notification'), params);

export const getCountNotificationUnread = () => sendGet(assignBaseUrl('app/count-notification-unread'));
export const readNotification = (payload: IPayloadReadNotification) =>
  sendPost(assignBaseUrl('app/read-notification'), payload);

export const getProjectIssueComment = (issueId: number, params?: IParamsListComment) =>
  sendGet(assignBaseUrl(`comment/${issueId}`), params);

export const createProjectIssueComment = (issueId: number, payload: IPayloadCreateProjectIssueComment) =>
  sendPost(assignBaseUrl(`comment/${issueId}`), payload);

export interface IPayloadCreateProjectIssueComment {
  content?: string;
  files?: string[];
}

export interface IParamsListComment {
  skip?: number;
  pageSize?: number;
  pageIndex?: number;
  keyword?: string;
}

export interface IPayloadReadNotification {
  notificationIds: number[];
}
export interface IParamsListNotification {
  skip?: number;
  take?: number;
  pageSize?: number;
  pageIndex?: number;
  keyword?: string;
  isRead?: CommonStatus;
}

export interface IAddWikiProject {
  subject: string;
  content: string;
}
export interface IListWikiProject {
  skip?: number;
  take?: number;
  pageSize?: number;
  pageIndex?: number;
  keyword?: string;
}
export interface IUpdateStaff {
  userId: number;
  status?: UserProjectStatus;
  role?: UserProjectRole;
  categoryIds?: number[];
}

export interface IPayloadUpdateIssue {
  typeId?: number;
  subject?: string;
  description?: string;
  stateId?: number;
  issuePostId?: number;
  assigneeId?: number;
  priority?: number;
  versionId?: number;
  categoryId?: number;
  startDate?: any;
  dueDate?: any;
  estimatedHours?: number;
  actualHours?: number;
}

export interface issueDetail {
  id: number;
  subject: string;
  assigneeId: number;
  categoryId: number;
  stateId: number;
  typeId: number;
  versionId: number;
  order: number;
  description: null;
  status: number;
  priority: Priority;
  startDate: string;
  dueDate: string;
  estimatedHours: string;
  actualHours: string;
  createdAt: string;
  type: {
    id: number;
    name: string;
    backgroundColor: string;
  };
  state: {
    id: number;
    name: string;
    backgroundColor: string;
  };
  assignee: {
    id: number;
    name: string;
    avatar: string;
    avatar50x50: string;
    avatar400x400: string;
    origin: string;
  };
  created: {
    id: number;
    name: string;
    avatar: string;
    avatar50x50: string;
    avatar400x400: string;
    origin: string;
  };
  category: {
    id: number;
    name: string;
  };
  version: {
    id: number;
    name: string;
  };
}
export interface IUpdateIssue {
  typeId?: number;
  subject?: string;
  description?: string;
  stateId?: number;
  issuePostId?: number;
  assigneeId?: number;
  priority?: Priority;
  categoryId?: number;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
}
export interface IAddMemberProject {
  email: string;
  role: UserProjectRole;
  categoryIds?: number[];
}
export interface IParamsGetMyProjects {
  skip?: number;
  take?: number;
  pageSize?: number;
  pageIndex?: number;
  keyword?: string;
  status?: number;
  state?: number;
}
export interface IParamsProjectIssueHistory {
  skip?: number;
  take?: number;
  pageSize?: number;
  pageIndex?: number;
  keyword?: string;
  issueId?: number;
}
export interface IFilterIssue {
  skip?: number;
  take?: number;
  pageSize?: number;
  pageIndex?: number;
  keyword?: string | null;
  stateIds?: number[];
  typeId?: number;
  categoryId?: number;
  versionId?: number;
  assigneeId?: number;
  isGetAll?: boolean;
  isCreated?: boolean;
  sortField?: string;
  exportCsv?: boolean;
  projectIds?: number[];
  isAdvancedSearch?: boolean;
}
export interface IPayloadCreateMyProjects {
  name: string;
  key: string;
}
export interface IPayloadUpdateMyProjects {
  name: string;
  key: string;
}
export interface IPayloadUpdateIssueType {
  projectIssueTypeId: number;
  projectIssueTypePostId?: number;
  projectIssueTypePreId?: number;
  status?: ProjectIssueTypeStatus;
  name?: string;
  backgroundColor?: string;
  description?: string;
}
export interface IPayloadUpdateIssueState {
  projectIssueStateId: number;
  projectIssueStatePostId?: number;
  projectIssueStatePreId?: number;
  status?: ProjectIssueTypeStatus;
  name?: string;
  backgroundColor?: string;
  description?: string;
}

export interface IPayloadUpdateIssueCategory {
  projectIssueCategoryId: number;
  projectIssueCategoryPostId?: number;
  projectIssueCategoryPreId?: number;
  status?: ProjectIssueCategoryStatus;
  name?: string;
  description?: string;
}
export interface IPayloadUpdateIssueVersion {
  projectIssueVersionId: number;
  projectIssueVersionPostId?: number;
  projectIssueVersionPreId?: number;
  status?: ProjectVersionStatus;
  name?: string;
  description?: string;
}
export interface IAddProjectIssue {
  typeId: number;
  subject: string;
  description: string;
  assigneeId: number;
  priority: number;
  startDate: any;
  dueDate: any;
  estimatedHours: number;
  actualHours: number;
  categoryId: number;
  versionId: number;
}
export interface IAddIssueType {
  name: number;
  backgroundColor: string;
  description: string;
}
export interface IAddIssueState {
  name: number;
  backgroundColor: string;
  description: string;
}
export interface IAddIssueCategory {
  name: number;
  description: string;
}
export interface IAddIssueVersion {
  name: number;
  description: string;
}
// export interface IMyProfileClient {
//   id: number;
//   lastCompanyId: number;
//   name: string;
//   gender: Gender;
//   address: string;
//   birthday: string;
//   email: string;
//   phone: string;
//   avatar: string;
//   avatar50x50: string;
//   avatar400x400: string;
//   origin: string;
// }
