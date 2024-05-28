import { IPayloadReadNotification, getListNotification, readNotification } from '@/api/client/project';
import queryKeys from '@/connstant/queryKeys';
import { convertTimeToRelative } from '@/utils/helper/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Divider, List, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './styles.module.scss';
import { handleErrorMessage } from '@/i18n';
import { UserOutlined } from '@ant-design/icons';
import { NotificationRedirectType, NotificationTargetType } from '@/connstant/enum/common';
import { history } from '@/App';
interface INotification {
  id: number;
  title: string;
  content: string;
  targetType: NotificationTargetType;
  targetId: number;
  redirectType: NotificationRedirectType;
  redirectId: number;
  createdAt: string;
  notificationMember: {
    isRead: number;
    status: number;
  };
  createdBy: {
    id: number;
    name: string;
    avatar: string;
    avatar50x50: string;
    avatar400x400: string;
    origin: string;
  };
}
export default function ListNotification(params: { isRead: boolean | undefined; onCloseNotification: () => void }) {
  const [listNotification, setListNotification] = useState<INotification[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const queryClient = useQueryClient();

  const init = { pageSize: 10, pageIndex };
  if (params.hasOwnProperty('isRead') && params.isRead != undefined) {
    Object.assign(init, { isRead: Number(params.isRead) });
  }
  const { data: listNotificationData } = useQuery({
    queryKey: [queryKeys.listNotification, pageIndex, params.isRead],
    queryFn: () => getListNotification(init),
    keepPreviousData: true,
  });

  const handleReadNotification = useMutation({
    mutationFn: (params: IPayloadReadNotification) => readNotification(params),
  });

  const loadMoreData = () => {
    if (!listNotificationData?.hasMore) {
      return;
    }

    setPageIndex(pageIndex + 1);
  };
  useEffect(() => {
    if (listNotificationData?.pageIndex === 1) {
      setListNotification([...(listNotificationData?.data || [])]);
    }
    if (listNotificationData?.pageIndex !== 1) {
      setListNotification([...listNotification, ...(listNotificationData?.data || [])]);
    }
  }, [listNotificationData?.data]);
  useEffect(() => {
    setPageIndex(1);
  }, [params.isRead]);

  const handleClickNoti = (noti: INotification) => {
    handleReadNotification.mutate(
      { notificationIds: [noti.id] },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries([queryKeys.listNotification]);
          queryClient.invalidateQueries([queryKeys.countNotiUnread]);
          params.onCloseNotification();

          switch (noti.redirectType) {
            case NotificationRedirectType.PROJECT_BOARD: {
              history.push(`/project/${noti.redirectId}/board`);

              break;
            }
            case NotificationRedirectType.HOME: {
              history.push(`/`);
              break;
            }
            case NotificationRedirectType.PROJECT_SETTING_MEMBER: {
              history.push(`/project/${noti.redirectId}/setting/members`);
              break;
            }
            case NotificationRedirectType.PROJECT_ISSUE: {
              history.push(`/project/${noti.redirectId}/issue/${noti.targetId}`);
              break;
            }
            default: {
              break;
            }
          }
        },
        onError: (error) => {
          handleErrorMessage(error);
        },
      },
    );
  };
  return (
    <div className={styles.scrollContainer} id="scrollableDiv">
      <InfiniteScroll
        dataLength={listNotification?.length}
        next={loadMoreData}
        hasMore={listNotificationData?.hasMore}
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          dataSource={listNotification}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              style={{ backgroundColor: item.notificationMember.isRead ? '#e5e5e5' : '#fcfade', cursor: 'pointer' }}
              onClick={() => handleClickNoti(item)}
            >
              <List.Item.Meta
                style={{ padding: '5px 10px' }}
                avatar={<Avatar src={item.createdBy?.avatar50x50} icon={<UserOutlined />} />}
                title={item.title}
                description={
                  <>
                    <span style={{ fontWeight: '500' }}>{item.content}</span>
                    <p style={{ margin: '0px', textAlign: 'end' }}>{convertTimeToRelative(item.createdAt)}</p>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </InfiniteScroll>
    </div>
  );
}
