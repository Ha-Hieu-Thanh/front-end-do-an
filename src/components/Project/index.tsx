import { getProjectIssueHistory } from '@/api/client/project';
import { IssueHistoryType } from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import useGetProjectDetail, { IDetailProject } from '@/utils/hooks/useGetDetailProject';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Col, Divider, List, Row, Skeleton } from 'antd';
import { first } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useParams } from 'react-router-dom';
import styles from './styles.module.scss';
import icons from '@/assets/icons';
export interface DataIssueHistory {
  id: number;
  issueId: number;
  projectId: number;
  metadata: {
    dataNew?: any;
    dataCurrent?: any;
  };
  type: number;
  createdAt: string;
  created: {
    id: number;
    name: string;
    avatar: string;
    avatar50x50: string;
    avatar400x400: string;
    origin: string;
  };
  project: {
    id: number;
    name: string;
    key: string;
  };
}
export default function Project() {
  const { data } = useGetProjectDetail();
  const project = data?.data as IDetailProject;
  const issueCount = project?.issueCount;
  const params = useParams();
  const projectId = Number(params.projectId);
  const dataCategories = useMemo(() => {
    return project?.projectIssueCategories.map((category) => {
      const dataGraph = project?.projectIssueStates.reduce(
        (acc, cur) => {
          const issueCount = category.byState?.[cur.id] || 0;
          const percent = `${Math.round((issueCount / category.issueCount) * 100 || 0)}%`;
          if (issueCount) {
            acc.percents.push(
              <Col span={6}>
                <p style={{ margin: '0px', color: cur.backgroundColor, fontSize: '1.2rem', fontWeight: '500' }}>
                  {percent} {cur.name}
                </p>
              </Col>,
            );
          }

          acc.graphs.push(
            <div
              style={{
                width: percent,
                backgroundColor: cur.backgroundColor,
                height: '100%',
              }}
              title={cur.name}
            ></div>,
          );
          return acc;
        },
        { graphs: [] as any, percents: [] as any[] },
      );
      return (
        <div className={styles.issueCategory} key={category.id}>
          <Link to={'/'}>{category.name}</Link>

          <div
            className={styles.issueCategoryGraph}
            style={{ width: '100%', height: '10px', display: 'flex', marginTop: '10px' }}
          >
            {dataGraph.graphs}
          </div>
          <Row gutter={[16, 16]}>{dataGraph.percents}</Row>
        </div>
      );
    });
  }, [data]);
  const dataVersions = useMemo(() => {
    return project?.projectVersions.map((version) => {
      const dataGraph = project?.projectIssueStates.reduce(
        (acc, cur) => {
          const issueCount = version.byState?.[cur.id] || 0;
          const percent = `${Math.round((issueCount / version.issueCount) * 100 || 0)}%`;
          if (issueCount) {
            acc.percents.push(
              <Col span={6}>
                <p style={{ margin: '0px', color: cur.backgroundColor, fontSize: '1.2rem', fontWeight: '500' }}>
                  {percent} {cur.name}
                </p>
              </Col>,
            );
          }

          acc.graphs.push(
            <div
              style={{
                width: percent,
                backgroundColor: cur.backgroundColor,
                height: '100%',
              }}
              title={cur.name}
            ></div>,
          );
          return acc;
        },
        { graphs: [] as any, percents: [] as any[] },
      );
      return (
        <div className={styles.issueVersion} key={version.id}>
          <Link to={'/'}>{version.name}</Link>

          <div
            className={styles.issueVersionGraph}
            style={{ width: '100%', height: '10px', display: 'flex', marginTop: '10px' }}
          >
            {dataGraph.graphs}
          </div>
          <Row gutter={[16, 16]}>{dataGraph.percents}</Row>
        </div>
      );
    });
  }, [data]);
  const [pageIndex, setPageIndex] = useState(1);
  const [issueHistory, setIssueHistory] = useState<DataIssueHistory[]>([]);

  const { data: issueHistoryData } = useQuery({
    queryKey: [queryKeys.projectIssueHistory, pageIndex, projectId],
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
    if (issueHistory.length && first(issueHistory)?.projectId !== projectId) {
      setPageIndex(1);
      setIssueHistory([]);
    }
  }, [projectId]);

  const titleIssueHistory = (type: IssueHistoryType, name: string, id: number) => {
    if (type === IssueHistoryType.CREATE) {
      return (
        <div className={styles.issueHistoryTitle}>
          <span className={styles.issueHistorySpan}>
            <span>{name}</span>
            <span className={styles.issueHistoryMain}>created</span>
            <span style={{ fontWeight: '600' }}> new issue</span>
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
    <Row className={styles.projectBoard}>
      <Col span={16} className={styles.projectBoardLeft}>
        <h4>Project issue history</h4>

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
                    avatar={<Avatar src={item.created.avatar50x50 ?? icons.HedLayer} />}
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
      </Col>
      <Col span={8} className={styles.projectBoardRight}>
        <h4>States</h4>
        <div className={styles.projectBoardState}>
          <div className={styles.boardStateGraph} style={{ width: '100%', height: '10px' }}>
            {project?.projectIssueStates.map((state, index) => (
              <div
                style={{
                  width: `${(state.issueCount / issueCount) * 100 || 0}%`,
                  backgroundColor: state.backgroundColor,
                }}
                title={state.name}
                key={index}
              ></div>
            ))}
          </div>
          <Row gutter={[16, 16]} className={styles.boardStateItems}>
            {project?.projectIssueStates.map((state) => (
              <Col span={6} className={styles.boardStateItem}>
                <p>{state.name}</p>
                <div style={{ backgroundColor: state.backgroundColor }}>{state.issueCount}</div>
              </Col>
            ))}
          </Row>
        </div>

        <h4>Types</h4>
        <div className={styles.projectBoardState}>
          <div className={styles.boardStateGraph} style={{ width: '100%', height: '10px' }}>
            {project?.projectIssueTypes.map((type, index) => (
              <div
                style={{
                  width: `${(type.issueCount / issueCount) * 100 || 0}%`,
                  backgroundColor: type.backgroundColor,
                }}
                title={type.name}
                key={index}
              ></div>
            ))}
          </div>
          <Row gutter={[16, 16]} className={styles.boardTypeItems}>
            {project?.projectIssueTypes.map((type, index) => (
              <Col span={6} className={styles.boardTypeItem} key={index}>
                <p>{type.name}</p>
                <div style={{ backgroundColor: type.backgroundColor }}>{type.issueCount}</div>
              </Col>
            ))}
          </Row>
        </div>

        <h4>Categories By State</h4>
        <div className={styles.projectIssueCategories}>{dataCategories?.length ? dataCategories : 'No Category'}</div>

        <h4>Versions By State</h4>
        <div className={styles.projectVersions}>{dataVersions?.length ? dataVersions : 'No Version'}</div>
      </Col>
    </Row>
  );
}
