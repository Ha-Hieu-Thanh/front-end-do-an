import { SocketEventKeys } from '@/connstant/enum/common';

export enum ConversationEvent {
  GET_OR_CREATE_CONVERSATION_P2P = 'GET_OR_CREATE_CONVERSATION_P2P',
  FETCH_LIST_CONVERSATION = 'FETCH_LIST_CONVERSATION',
  CONVERSATION = 'CONVERSATION',
  UPDATE_LAST_TIME_VIEW = 'UPDATE_LAST_TIME_VIEW',
  FETCH_MESSAGE = 'FETCH_MESSAGE',
  SEND_MESSAGE = 'SEND_MESSAGE',
  JOIN_ISSUE_COMMENT = 'JOIN_ISSUE_COMMENT',
}

interface DataSendNotification {
  data: {
    title: string;
    content: string;
    redirectId: number;
    payload: {
      totalUnread: number;
    };
  };
}

export interface ServerToClientEvents {
  [SocketEventKeys.PONG]: (data: DataSendNotification) => void;
}

export interface ClientToServerEvents {}
