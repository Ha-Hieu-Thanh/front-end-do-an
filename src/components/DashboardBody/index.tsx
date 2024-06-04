import { confirmJoinProject, getMyProjects, getProjectIssueHistory } from '@/api/client/project';
import icons from '@/assets/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Col, Collapse, Divider, List, Row, Skeleton, message } from 'antd';
import classNames from 'classnames';
import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.scss';
import { DownOutlined } from '@ant-design/icons';
import queryKeys from '@/connstant/queryKeys';
import { IssueHistoryType, UserProjectStatus, UserRole } from '@/connstant/enum/common';
import { history } from '@/App';
import { handleSuccessMessage } from '@/utils/helper/common';
import { handleErrorMessage } from '@/i18n';
import InfiniteScroll from 'react-infinite-scroll-component';
import { DataIssueHistory } from '../Project';
import Cookies from 'js-cookie';
import useProfileClient from '@/utils/hooks/useProfileClient';
function DashboardBody() {
  const { profile } = useProfileClient(true);
  useEffect(() => {
    if (profile && profile.role !== UserRole.CLIENT) {
      history.push('/forbidden-resource');
    }
  }, [profile]);

  Cookies.remove('projectId');
  const [pageIndexProjects, setPageIndexProjects] = useState(1);
  const [projects, setProjects] = useState<any>([]);

  const [pageIndex, setPageIndex] = useState(1);
  const [issueHistory, setIssueHistory] = useState<DataIssueHistory[]>([]);

  const { data: dataProjects } = useQuery(
    [queryKeys.projectList, pageIndexProjects],
    () => getMyProjects({ pageSize: 5, pageIndex: pageIndexProjects }),
    {
      keepPreviousData: true,
    },
  );
  const queryClient = useQueryClient();

  const { data: issueHistoryData } = useQuery({
    queryKey: [queryKeys.projectIssueHistory, pageIndex],
    queryFn: () => getProjectIssueHistory({ pageSize: 10, pageIndex }),
    keepPreviousData: true,
  });

  const loadMoreData = () => {
    if (!issueHistoryData?.hasMore) {
      return;
    }
    setPageIndex(pageIndex + 1);
  };

  useEffect(() => {
    if (pageIndex === 1) {
      setIssueHistory([...(issueHistoryData?.data || [])]);
    }
    if (pageIndex !== 1) {
      setIssueHistory([...issueHistory, ...(issueHistoryData?.data || [])]);
    }
  }, [issueHistoryData?.data]);

  useEffect(() => {
    if (dataProjects?.data && dataProjects?.data.pageIndex != 1) {
      setProjects([...projects, ...dataProjects?.data]);
    }
    if (dataProjects?.data && dataProjects?.pageIndex === 1) {
      setProjects(dataProjects?.data);
    }
  }, [dataProjects]);

  const handleDownOutlined = () => {
    if (pageIndexProjects !== dataProjects?.totalPages) setPageIndexProjects(pageIndexProjects + 1);
  };
  const joinProjectMutation = useMutation({
    mutationFn: (payload: { status: UserProjectStatus; projectId: number }) => confirmJoinProject(payload),
  });
  const handleJoinProject = (status: UserProjectStatus, projectId: number, e: any) => {
    joinProjectMutation.mutate(
      { status, projectId },
      {
        onSuccess: () => {
          if (status === UserProjectStatus.ACTIVE) {
            handleSuccessMessage('Join project success!');
          }
          if (status === UserProjectStatus.REJECT) {
            handleSuccessMessage('Reject join project success!');
          }
          queryClient.invalidateQueries([queryKeys.projectList]);
        },
        onError: (error) => {
          handleErrorMessage(error);
          queryClient.invalidateQueries([queryKeys.projectList]);
        },
      },
    );
    e.stopPropagation();
  };

  const titleIssueHistory = (type: IssueHistoryType, name: string, id: number) => {
    if (type === IssueHistoryType.CREATE) {
      return (
        <div className={styles.issueHistoryTitle}>
          <span className={styles.issueHistorySpan}>
            <span>{name}</span>
            <span style={{ fontWeight: '600' }}>added a new</span>
            <span className={styles.issueHistoryMain}>issue</span>
          </span>
        </div>
      );
    }
    if (type === IssueHistoryType.UPDATE) {
      return (
        <div className={styles.issueHistoryTitle}>
          <span className={styles.issueHistorySpan}>
            <span>{name}</span>
            <span className={styles.issueHistoryMain}>updated</span>
            <span style={{ fontWeight: '600' }}>the issue</span>
          </span>
        </div>
      );
    }
  };
  const contentIssueHistory = (type: IssueHistoryType, metadata: any) => {
    if (type === IssueHistoryType.CREATE) {
      const dataNew = metadata?.dataNew;
      return (
        <div className={styles.issueHistoryContent}>
          <span>
            <span>Subject: </span>
            <span>{dataNew?.subject}</span>
          </span>
        </div>
      );
    }
    if (type === IssueHistoryType.UPDATE) {
      const dataNew = metadata?.dataNew;
      const dataCurrent = metadata?.dataCurrent;
      return (
        <div className={styles.issueHistoryContent}>
          {Object.keys(dataCurrent).map((key, index) => (
            <div key={index}>
              <span>
                <span>{key}: </span>
                <span>
                  {dataCurrent[key]} {'->'} {dataNew[key]}
                </span>
              </span>
            </div>
          ))}
        </div>
      );
    }
  };
  return (
    <Row className={styles.dashboardBody}>
      <Col span={12} className={styles.dashboardBodyLeft}>
        <div className={styles.dashboardBodyProject}>
          <Collapse
            ghost
            defaultActiveKey={['PROJECT']}
            items={[
              {
                key: 'PROJECT',
                label: 'Projects',
                children: (
                  <div>
                    <div className={classNames(styles.dashboardBodyProjectMain)}>
                      {projects.map((item: any) => (
                        <div
                          key={item.id}
                          className={classNames(styles.dashboardBodyProjectItem)}
                          onClick={() => {
                            history.push(`/project/${item.id}`);
                          }}
                        >
                          <div>
                            <div
                              onClick={() => {
                                // if (item?.userProject?.status === UserProjectStatus.ACTIVE) {
                                //   history.push(`/project/${item.id}`);
                                // }
                                if (item?.userProject?.status === UserProjectStatus.PENDING) {
                                  message.error('You are not in the project, please join to continue');
                                }
                              }}
                              className={styles.dashProjectsItemTop}
                            >
                              <div>
                                <span className={styles.dashProjectsItemName}>{item.name}</span> <br />
                                <span
                                  className={classNames(styles.dashProjectsItemKey, styles.displayNoneDashProjectsItem)}
                                >
                                  {item.key}
                                </span>
                                {item?.userProject?.status === UserProjectStatus.ACTIVE && (
                                  <div
                                    className={classNames(
                                      styles.displayDashProjectsItem,
                                      styles.dashProjectsItemBottom,
                                    )}
                                    style={{ display: 'none' }}
                                  >
                                    <Link
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      to={`/project/${item.id}/add-issue`}
                                    >
                                      Add Issue
                                    </Link>
                                    <Link
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      to={`/project/${item.id}/issue`}
                                    >
                                      Issue
                                    </Link>
                                    <Link
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      to={`/project/${item.id}/board`}
                                    >
                                      Board
                                    </Link>

                                    <Link
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      to={`/project/${item.id}/wiki`}
                                    >
                                      Wiki
                                    </Link>
                                  </div>
                                )}
                              </div>
                              {item?.userProject?.status === UserProjectStatus.ACTIVE && (
                                <Link
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  to={`/project/${item.id}/setting`}
                                >
                                  <img
                                    style={{ display: 'none' }}
                                    src={icons.Setting}
                                    alt="Setting detail project"
                                    title="Project setting"
                                    className={classNames(styles.displayDashProjectsItem)}
                                  ></img>
                                </Link>
                              )}

                              {item?.userProject?.status === UserProjectStatus.PENDING && (
                                <div
                                  className={styles.dashProjectsConfirm}
                                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                  <button
                                    onClick={(e) => handleJoinProject(UserProjectStatus.ACTIVE, item.id, e)}
                                    type="submit"
                                    className="btn btn-green"
                                    style={{ height: '35px', color: 'black' }}
                                  >
                                    Confirm join to project
                                  </button>
                                  <button
                                    onClick={(e) => handleJoinProject(UserProjectStatus.REJECT, item.id, e)}
                                    type="submit"
                                    className="btn btn-black"
                                    style={{ height: '35px' }}
                                  >
                                    Reject join to project
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      onClick={handleDownOutlined}
                      className={classNames(
                        styles.bottomDownUpOutlined,
                        pageIndexProjects === dataProjects?.totalPages ? styles.displayDownUpOutlined : '',
                      )}
                      style={{ marginTop: '10px' }}
                    >
                      <DownOutlined />
                    </div>
                  </div>
                ),
              },
            ]}
          />
          {/* <Collapse ghost items={[{ key: 'MY_ISSUES', label: 'My Issues', children: <p>My Issues</p> }]} /> */}
          {/* <Collapse ghost items={[{ key: 'BACKLOG_NEWS', label: 'Backlog News', children: <p>Backlog News</p> }]} /> */}
        </div>
      </Col>
      <Col span={12} className={styles.dashboardBodyRight}>
        <Collapse
          ghost
          items={[
            {
              key: 'RECENT_UPDATES',
              label: 'Recent Updates',
              children: (
                <div
                  id="scrollableDiv"
                  style={{
                    height: 750,
                    overflow: 'auto',
                    padding: '0 16px',
                    border: '1px solid rgba(140, 140, 140, 0.35)',
                    maxWidth: '56vw',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <InfiniteScroll
                    dataLength={issueHistory?.length}
                    next={loadMoreData}
                    hasMore={issueHistoryData?.hasMore}
                    loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                    endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
                    scrollableTarget="scrollableDiv"
                  >
                    <List
                      dataSource={issueHistory}
                      renderItem={(item) => (
                        <List.Item key={item.created.name}>
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                size={40}
                                src={item.created.avatar50x50 ? item.created.avatar50x50 : icons.HedLayer}
                              ></Avatar>
                            }
                            title={titleIssueHistory(item.type, item.created.name, item.id)}
                            description={
                              <>
                                <Link
                                  to={'/'}
                                  style={{
                                    color: '#00836b',
                                    textDecoration: 'none',
                                    outline: 0,
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                  }}
                                >
                                  {item.project?.key}-{item.issueId}
                                </Link>
                                {contentIssueHistory(item.type, item.metadata)}
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </InfiniteScroll>
                </div>
              ),
            },
          ]}
        />
      </Col>
    </Row>
  );
}

export default memo(DashboardBody);
