export const REGEX_PASSWORD = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z_@./!#$%^*()&+-]{8,}$/;
export enum LabelDefault {
  Email = 'Email',
  Password = 'Password',
  PasswordConfirm = 'Password confirm',
}
export enum Message {
  ERROR_REQUIRE_PASSWORD = 'Required Password',
  ERROR_REQUIRE_EMAIL = 'Required Email',
  ERROR_FORMAT_PASSWORD = 'Error format password',
  ERROR_FORMAT_EMAIL = 'Error format email',
  ERROR_REQUIRE_PROJECT_NAME = 'Required project name',
  ERROR_FORMAT_PROJECT_NAME = 'Format project name',
  ERROR_REQUIRE_PROJECT_KEY = 'Require project key',
  ERROR_FORMAT_PROJECT_KEY = 'Format project key',
  ERROR_NO_PASSWORD_MATCH = 'Password not equal password confirm',
  ERROR_REQUIRE_ASSIGNEE = 'Required assignee',
  ERROR_REQUIRE_STATE = 'Required state',
  ERROR_START_DATE_MORE_THAN_DUE_DATE = 'Start date more than due date',
  ERROR_REQUIRE_ISSUE_NAME = 'Required issue name',
  ERROR_FORMAT_ISSUE_NAME = 'Format issue name',
  ERROR_REQUIRE_SUBJECT = 'Required subject',
  ERROR_REQUIRE_CONTENT = 'Required content',
}

export enum ClientLoginType {
  DEFAULT = 1,
  LINE = 2,
  GOOGLE = 3,
  FACEBOOK = 4,
  TWITTER = 5,
  YAHOO = 6,
}

export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Test = 'test',
}

export enum Gender {
  MALE = 1,
  FEMALE = 2,
  ALL = 3,
}

export enum MenuKey {
  LOGOUT = 1,
  ACTIVITY = 2,
  GANTT_CHART = 3,
  PERSONAL_SETTINGS = 4,
  REFERRAL_PROGRAM = 5,
  SEARCH_PROJECTS = 6,
  SEARCH_PROJECTS_PAGE_SIZE = 7,
  CHANGE_PASSWORD = 8,
}

export enum UserProjectRole {
  PM = 1,
  SUB_PM = 2,
  STAFF = 3,
}

export interface IFilter {
  pageIndex?: number;
  pageSize?: number;
  take?: number;
  keyword?: string;
  skip?: number;
}
export interface ILoadMore {
  pageSize?: number;
  take?: number;
  keyword?: string;
}
export interface IFilterStaff extends IFilter {
  status?: number[];
}

export enum ConversationType {
  P2P = 'P2P',
  GROUP = 'GROUP',
}

export interface ILoadMoreFetchConversation extends ILoadMore {
  lastMessageCreatedAt?: number;
  type?: ConversationType;
}
export interface ILoadMoreFetchMessage extends ILoadMore {
  conversationId: string;
  lastItemCreatedAt?: number;
}
export const PAGE_INDEX = 1;
export const PAGE_SIZE = 10;
export enum TextALign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}
export enum Priority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
}
export const TextPriority = {
  [Priority.LOW]: 'Low',
  [Priority.NORMAL]: 'Normal',
  [Priority.HIGH]: 'High',
};
export enum UserProjectStatus {
  IN_ACTIVE = 1,
  ACTIVE = 2,
  PENDING = 3,
  REJECT = 4,
}
export const UserProjectRoleText = {
  [UserProjectRole.PM]: 'PM',
  [UserProjectRole.SUB_PM]: 'SUB PM',
  [UserProjectRole.STAFF]: 'STAFF',
};
export const UserProjectStatusText = {
  [UserProjectStatus.ACTIVE]: 'Active',
  [UserProjectStatus.IN_ACTIVE]: 'In Active',
  [UserProjectStatus.PENDING]: 'Pending',
  [UserProjectStatus.REJECT]: 'Reject',
};
export enum IssueHistoryType {
  CREATE = 1,
  UPDATE = 2,
}
export enum ProjectIssueTypeStatus {
  IN_ACTIVE = 1,
  ACTIVE = 2,
}
export enum ProjectIssueCategoryStatus {
  IN_ACTIVE = 1,
  ACTIVE = 2,
}
export enum DragDropType {
  ISSUE_TYPE = 1,
  ISSUE_CATEGORY = 2,
  VERSION = 3,
  STATE = 4,
}
export enum ProjectVersionStatus {
  IN_ACTIVE = 1,
  ACTIVE = 2,
}

export enum SocketEventKeys {
  PING = 'PING',
  PONG = 'PONG',
  INVALID_INPUT = 'INVALID_INPUT',

  GET_OR_CREATE_CONVERSATION_P2P = 'GET_OR_CREATE_CONVERSATION_P2P',
  FETCH_LIST_CONVERSATION = 'FETCH_LIST_CONVERSATION',
  SEND_MESSAGE = 'SEND_MESSAGE',
  JOIN_CONVERSATION = 'JOIN_CONVERSATION',
  LEAVE_CONVERSATION = 'LEAVE_CONVERSATION',
  NEW_MESSAGE = 'NEW_MESSAGE',
  CONVERSATION = 'CONVERSATION',
  FETCH_MESSAGE = 'FETCH_MESSAGE',
}
export enum ActionConversationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  UPDATE_LAST_TIME_VIEW = 'UPDATE_LAST_TIME_VIEW',
}
export enum CommonStatus {
  IN_ACTIVE = 0,
  ACTIVE = 1,
}
export enum NotificationType {}

export enum NotificationRedirectType {
  PROJECT_BOARD = 1,
  HOME = 2,
  PROJECT_SETTING_MEMBER = 3,
  PROJECT_ISSUE = 4,
}

export enum NotificationTargetType {
  SYSTEM = 1,
  CLIENT = 2,
  PROJECT = 2,
}
export enum ReadNotification {
  UNREAD = 0,
  READ = 1,
}
