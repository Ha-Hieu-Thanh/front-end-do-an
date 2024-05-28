import {
  ActionConversationType,
  ILoadMoreFetchConversation,
  ILoadMoreFetchMessage,
  PAGE_SIZE,
} from '@/connstant/enum/common';
import socket from '@/utils/socket';
import { ConversationEvent } from '@/utils/socket/socket.type';
import { AlignCenterOutlined, HighlightOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Avatar, Col, Input, List, Row, message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { formatTimestamp, handleLastNameMember, replaceNumberWithDots } from '@/utils/helper/common';
import classNames from 'classnames';
import icons from '@/assets/icons';
import TextArea from 'antd/es/input/TextArea';

const initialLoadMoreFetchConversation: ILoadMoreFetchConversation = {
  pageSize: PAGE_SIZE,
};
const initialLoadMoreFetchMessage: ILoadMoreFetchMessage = {
  pageSize: PAGE_SIZE,
  conversationId: '',
};

export interface IConversation {
  conversationId: string;
  conversationType: string;
  memberId: number;
  status: number;
  lastTimeView: number;
  target: {
    _id: string;
    id: number;
    name: string;
    status: number;
    avatar: number;
  };
  conversationData: {
    type: string;
    status: number;
    createdBy: 2;
    name?: string;
    avatar?: string;
  };
  lastMessageData: IMessage;
  lastMessageCreatedAt: number;
}

interface INewMessage {
  id: string;
  type: ActionConversationType;
  message?: IMessage;
  lastTimeView?: number;
}
interface IMessage {
  conversationId: string;
  memberId: number;
  content: string;
  status: number;
  _id: string;
  createdAt: number;
  updatedAt: number;
  __v: number;
  member: {
    name: string;
    status: number;
    avatar: string;
  };
}

export default function Chat() {
  const [loadMoreFetchConversation, setLoadMoreFetchConversation] = useState<ILoadMoreFetchConversation>(
    initialLoadMoreFetchConversation,
  );
  const [loadMoreFetchMessage, setLoadMoreFetchMessage] = useState<ILoadMoreFetchMessage>(initialLoadMoreFetchMessage);
  const [listConversation, setListConversation] = useState<IConversation[]>([]);
  const [listMessage, setListMessage] = useState<IMessage[]>([]);
  const [userIdCall, setUserIdCall] = useState<number>(-1);
  const [currentConversation, setCurrentConversation] = useState<IConversation>();

  useEffect(() => {
    if (currentConversation?.conversationId) {
      socket.emit(
        ConversationEvent.FETCH_MESSAGE,
        { ...loadMoreFetchConversation, conversationId: currentConversation.conversationId },
        (data: { success: boolean; userIdCall: number; chanel: string; data: IMessage[] }) => {
          if (data.data?.length) {
            setListMessage(data.data.reverse());
          }
        },
      );
    }
  }, [currentConversation]);

  useEffect(() => {
    socket.emit(
      ConversationEvent.FETCH_LIST_CONVERSATION,
      loadMoreFetchConversation,
      (data: { success: boolean; userIdCall: number; chanel: string; data: IConversation[] }) => {
        if (data.data?.length) {
          setListConversation(data.data);
          setUserIdCall(data.userIdCall);
          setCurrentConversation(data.data[0]);
        }
      },
    );
    socket.on(ConversationEvent.CONVERSATION, (data: INewMessage) => {
      if (data.type === ActionConversationType.NEW_MESSAGE) {
        if (data.id === listMessage[0].conversationId && data.message) {
          setListMessage((prev) => {
            const newData = [...prev, data.message] as IMessage[];

            return newData;
          });
        }
        setListConversation((prev) => {
          const newData = JSON.parse(JSON.stringify(prev)) as IConversation[];
          const index = newData.findIndex((item) => item.conversationId === data.id);

          if (index !== -1) {
            const item = newData[index];
            Object.assign(item, { lastMessageData: data.message, lastMessageCreatedAt: data.message?.createdAt });
            newData.splice(index, 1);
            newData.unshift(item);
          }

          return newData;
        });
      }
      if (data.type === ActionConversationType.UPDATE_LAST_TIME_VIEW) {
        setListConversation((prev) => {
          const newData = JSON.parse(JSON.stringify(prev)) as IConversation[];
          const index = newData.findIndex((item) => item.conversationId === data.id);
          Object.assign(newData[index], { lastTimeView: data.lastTimeView });

          return newData;
        });
      }
    });

    return () => {
      socket.off(ConversationEvent.CONVERSATION);
    };
  }, []);

  const handleEnter = (event: any) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      const value = event.target.value;
      const conversationId = currentConversation?.conversationId;
      if (value) {
        socket.emit(ConversationEvent.SEND_MESSAGE, { conversationId, content: value }, (data: any) => {
          return;
        });
      }
    }
  };
  return (
    <div className={styles.chat}>
      <Row style={{ height: '100%' }}>
        <Col span={5} className={styles.chatLeft}>
          <div className={styles.chatLeftHeader}>
            <Row style={{ borderBottom: '1px solid #c2c2c2', height: '100%' }}>
              <Col span={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: '35px', fontWeight: '700' }}>Chat</span>
              </Col>
              <Col
                span={16}
                style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', paddingRight: '40px' }}
              >
                <AlignCenterOutlined
                  title="Filter"
                  onClick={() => {}}
                  style={{ fontSize: '30px', marginRight: '40px', cursor: 'pointer' }}
                />
                <PlusCircleOutlined
                  title="New chat"
                  onClick={() => {}}
                  style={{ fontSize: '30px', cursor: 'pointer' }}
                />
              </Col>
            </Row>
          </div>
          <div className={styles.chatLeftMain}>
            {/* <InfiniteScroll
              dataLength={issueHistory?.length}
              next={loadMoreData}
              hasMore={issueHistoryData?.hasMore}
              loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
              endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
              scrollableTarget="scrollableDiv"
            > */}
            <List
              itemLayout="horizontal"
              dataSource={listConversation.map((item) => ({
                item: item,
                title: item.conversationData.name || item.target.name,
                avatar: item.conversationData.avatar || item.target.avatar,
                lastMessageData: item.lastMessageData,
                lastMessageCreatedAt: item.lastMessageCreatedAt,
                isNew: item.lastTimeView < item.lastMessageCreatedAt,
                isOnline: false,
              }))}
              renderItem={(item, index) => (
                <List.Item
                  onClick={() => {
                    if (item.item.conversationId !== currentConversation?.conversationId) {
                      setCurrentConversation(item.item);
                    }
                    if (item.isNew) {
                      socket.emit(ConversationEvent.UPDATE_LAST_TIME_VIEW, {
                        conversationId: item.item.conversationId,
                      });
                    }
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div>
                        {item.isNew && <div className={styles.circle}></div>}
                        <div style={{ position: 'relative' }}>
                          <Avatar size={40} src={item.avatar} />
                          {item.isOnline && <Avatar className={styles.available} size={20} src={icons.Available} />}
                        </div>
                      </div>
                    }
                    title={
                      <div
                        className={classNames(item.isNew ? styles.titleNotWatched : styles.titleWatched, styles.title)}
                      >
                        <span>{replaceNumberWithDots(item.title)}</span>
                        <span style={{ fontSize: '14px' }}>{formatTimestamp(item.lastMessageData.createdAt)}</span>
                      </div>
                    }
                    description={
                      <p className={classNames(item.isNew ? styles.messageNotWatched : styles.messageWatched)}>
                        {`${
                          userIdCall === item.lastMessageData.memberId
                            ? 'You'
                            : handleLastNameMember(item.lastMessageData.member.name)
                        }: ${replaceNumberWithDots(item.lastMessageData.content, 30)}`}
                      </p>
                    }
                  />
                </List.Item>
              )}
            />
            {/* </InfiniteScroll> */}
          </div>
        </Col>
        <Col span={19} className={styles.chatRight}>
          <div className={styles.chatRightHeader}>
            <Row style={{ borderBottom: '1px solid #c2c2c2', height: '100%' }}>
              <Col span={12} style={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                <div style={{ paddingLeft: '40px', display: 'flex', alignContent: 'center' }}>
                  <Avatar
                    size={50}
                    style={{ marginRight: '20px' }}
                    src={currentConversation?.conversationData.avatar || currentConversation?.target.avatar}
                  ></Avatar>
                  <span style={{ fontSize: '30px', fontWeight: '700', marginRight: '10px' }}>
                    {currentConversation?.conversationData.name || currentConversation?.target.name}
                  </span>
                  <HighlightOutlined
                    title="Edit name group chat"
                    onClick={() => {}}
                    style={{ fontSize: '30px', cursor: 'pointer' }}
                  />
                </div>
              </Col>
              <Col
                span={12}
                style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', paddingRight: '40px' }}
              ></Col>
            </Row>
          </div>
          <div className={styles.chatRightBody}>
            <div className={styles.chatBody}>
              {listMessage.map((message) => {
                return (
                  <div className={classNames(styles.chatItem, message.memberId === userIdCall && styles.chatItemMy)}>
                    {message.memberId !== userIdCall && (
                      <div className={classNames(styles.chatAvatar)}>
                        <Avatar size={38} src={message.member.avatar} style={{ marginRight: '10px' }}></Avatar>
                      </div>
                    )}

                    <div className={classNames(styles.chatContent)}>{message.content}</div>
                  </div>
                );
              })}
            </div>
            <div>
              <Input id="myInput" onKeyDown={handleEnter}></Input>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
