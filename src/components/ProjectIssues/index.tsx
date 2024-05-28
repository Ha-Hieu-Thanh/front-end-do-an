import {
  IFilterIssue,
  getIssueDetail,
  membersProject,
  projectIssueCategories,
  projectIssueList,
  projectIssueState,
  projectIssueTypes,
  projectIssueVersion,
} from '@/api/client/project';
import {
  PAGE_INDEX,
  Priority,
  TextALign,
  TextPriority,
  UserProjectRole,
  UserProjectStatus,
} from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import useProfileClient from '@/utils/hooks/useProfileClient';
import { UserOutlined, ToolOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import styled from '@xstyled/styled-components';
import { Avatar, Input, Modal, Select, Spin, Table } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import { useEffect, useState, useCallback, lazy, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CustomPagination from '../CustomPagination';
import { ChangeFillType } from '../ProjectBoard';
import { TitleIssueDetail } from '../ProjectBoard/task';
import styles from './styles.module.scss';
import useGetProjectDetail, { IDetailProject } from '@/utils/hooks/useGetDetailProject';
import debounce from 'lodash/debounce';
import icons from '@/assets/icons';

const DetailIssue = lazy(() => import('@/components/DetailIssue'));
interface IStatesSearch {
  name: string;
  stateIds: number[];
  isSearch: boolean;
}
const initialFilterIssue: IFilterIssue = {
  pageSize: 10,
  pageIndex: PAGE_INDEX,
  isGetAll: true,
};

const ItemType = styled.spanBox`
  color: white;
  background-color: ${(props: any) => props.backgroundColor};
  border-radius: 20px;
  padding: 1px 10px;
`;
const ItemKey = styled.aBox`
  color: #00836b;
`;
const ItemState = styled.spanBox`
  color: white;
  background-color: ${(props: any) => props.backgroundColor};
  border-radius: 20px;
  padding: 1px 10px;
`;

export default function DashboardProjectIssues() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const issueIdFromParam = params.issueId ? Number(params.issueId) : undefined;
  const { profile } = useProfileClient(true);
  const { data } = useGetProjectDetail();

  const [statesSearch, setStatesSearch] = useState<IStatesSearch[]>([]);
  const [stateIds, setStateIds] = useState<number[]>([]);
  const [assigneeId, setAssigneeId] = useState<ChangeFillType | undefined>(undefined);
  const [typeId, setTypeId] = useState<ChangeFillType | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<ChangeFillType | undefined>(undefined);
  const [versionId, setVersionId] = useState<ChangeFillType | undefined>(undefined);
  const [keyword, setKeyword] = useState<string | null>(null);
  const [filterIssues, setFilterIssues] = useState<IFilterIssue>(initialFilterIssue);
  const [openDetailIssue, setOpenDetailIssue] = useState(issueIdFromParam ? true : false);
  const [issueId, setIssueId] = useState<number | null>(issueIdFromParam ? issueIdFromParam : null);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isCreated, setsIsCreated] = useState<boolean>(false);

  const setSearchKeyword = useRef(
    debounce((value: string) => {
      setKeyword(value);
      setFilterIssues((prev) => ({ ...prev, pageIndex: 1 }));
    }, 500),
  );

  useEffect(() => {
    setOpenDetailIssue(issueIdFromParam ? true : false);
    setIssueId(issueIdFromParam ? issueIdFromParam : null);
  }, [params, issueIdFromParam]);

  const project = data?.data as IDetailProject;
  const userProject = project?.userProject;

  const { data: projectIssueStateQuery, isLoading: isLoadingState } = useQuery({
    queryKey: [queryKeys.projectIssueState, projectId],
    queryFn: () => projectIssueState({ pageSize: 1000 }),
    keepPreviousData: true,
  });

  const { data: projectIssueCategoriesQuery } = useQuery({
    queryKey: [queryKeys.projectIssueCategories, projectId],
    queryFn: () => projectIssueCategories({ pageSize: 100 }),
    keepPreviousData: true,
  });

  const { data: projectVersionQuery } = useQuery({
    queryKey: [queryKeys.projectVersion, projectId],
    queryFn: () => projectIssueVersion({ pageSize: 100 }),
    keepPreviousData: true,
  });

  const { data: membersProjectQuery } = useQuery({
    queryKey: [queryKeys.membersProject, projectId],
    queryFn: () => membersProject({ pageSize: 100, status: [UserProjectStatus.ACTIVE] }),
    keepPreviousData: true,
  });

  const { data: projectIssueTypeQuery } = useQuery({
    queryKey: [queryKeys.projectIssueTypes, projectId],
    queryFn: () => projectIssueTypes({ pageSize: 100 }),
    keepPreviousData: true,
  });

  const { data: issuesProjectQuery, isLoading: isLoadingIssue } = useQuery({
    queryKey: [
      queryKeys.issueList,
      projectId,
      keyword,
      typeId,
      categoryId,
      versionId,
      assigneeId,
      stateIds,
      filterIssues,
      isCreated,
    ],
    queryFn: () =>
      projectIssueList({ keyword, typeId, categoryId, versionId, assigneeId, isCreated, stateIds, ...filterIssues }),
    keepPreviousData: true,
  });

  useEffect(() => {
    const statesSearch = projectIssueStateQuery?.data.reduce((acc: IStatesSearch[], cur: any, index: number) => {
      if (!index) {
        acc[0] = {
          name: 'All',
          stateIds: [],
          isSearch: false,
        };
        acc[projectIssueStateQuery.data.length + 1] = {
          name: 'Not Closed',
          stateIds: [],
          isSearch: true,
        };
      }
      acc[0].stateIds.push(cur.id);
      acc[index + 1] = {
        name: cur.name,
        stateIds: [cur.id],
        isSearch: false,
      };

      if (cur.name !== 'Closed') {
        acc[projectIssueStateQuery.data.length + 1].stateIds.push(cur.id);
      }

      return acc;
    }, []);
    if (statesSearch) {
      setStatesSearch(statesSearch);
      setStateIds(statesSearch[statesSearch?.length - 1]?.stateIds);
    }
  }, [projectIssueStateQuery?.data]);

  const handleClickState = (index: number) => {
    setStatesSearch((prev) =>
      prev.map((item, iItem) => {
        if (iItem === index) {
          item.isSearch = true;
          setStateIds(item.stateIds);
        } else {
          item.isSearch = false;
        }
        return item;
      }),
    );
  };

  const handleAssignMyself = () => {
    if (assigneeId) {
      setAssigneeId(undefined);
    } else {
      setAssigneeId(profile?.id);
    }
  };

  const handleMyCreated = () => {
    setsIsCreated(!isCreated);
  };
  const onChange = (value: number, type: ChangeFillType) => {
    switch (type) {
      case ChangeFillType.TYPE:
        setTypeId(value);
        break;
      case ChangeFillType.CATEGORY:
        setCategoryId(value);
        break;
      case ChangeFillType.VERSION:
        setVersionId(value);
        break;
      case ChangeFillType.ASSIGNEE:
        setAssigneeId(value);
        break;

      default:
        break;
    }
  };

  const handleChangePage = (pageIndex: number, pageSize: number) => {
    setFilterIssues((prevFilterIssue) => {
      return {
        ...prevFilterIssue,
        pageIndex,
        pageSize,
      };
    });
  };

  const { data: issueDetail, refetch: refetchDetailIssue } = useQuery({
    queryKey: [queryKeys.issueDetail, issueId],
    queryFn: () => {
      if (issueId) return getIssueDetail(issueId!);
    },
    enabled: issueId !== undefined,
  });

  const showModalDetailIssue = useCallback(() => {
    setOpenDetailIssue(true);
  }, []);
  const handleCancelDetailIssue = useCallback(() => {
    setOpenDetailIssue(false);
  }, []);
  const handleKeyWord = ({ target }: { target: { value: string } }) => {
    setSearchKeyword.current(target.value);
  };

  const columns = [
    {
      title: 'Issue Type',
      dataIndex: ['projectIssueType'],
      key: 'issueType',
      render: (data: any, record: any) => {
        return <ItemType backgroundColor={data?.backgroundColor}>{data?.name}</ItemType>;
      },
    },
    {
      title: 'Key',
      key: 'issueKey',
      render: (data: any, record: any) => {
        return (
          <ItemKey>
            {data.project.key}-{data.id}
          </ItemKey>
        );
      },
    },
    {
      title: 'Subject',
      dataIndex: ['subject'],
      key: 'issueSubject',
      width: 300,
      render: (data: any, record: any) => {
        return <p style={{ overflowWrap: 'break-word', maxWidth: '350px' }}>{data}</p>;
      },
    },
    {
      title: 'CreatedBy',
      dataIndex: ['created'],
      key: 'issueCreatedBy',
      render: (data: any, record: any) => {
        return (
          <div>
            <Avatar src={data?.avatar400x400 ?? icons.HedLayer}></Avatar>
            <span style={{ marginLeft: '10px' }}>{data?.name || data?.email}</span>
          </div>
        );
      },
    },
    {
      title: 'Assignee',
      dataIndex: ['assignee'],
      key: 'issueAssignee',
      render: (data: any, record: any) => {
        return (
          <div>
            <Avatar src={data?.avatar400x400 ?? icons.HedLayer}></Avatar>
            <span style={{ marginLeft: '10px' }}>{data?.name || data?.email}</span>
          </div>
        );
      },
    },
    {
      title: 'State',
      dataIndex: ['projectIssueState'],
      key: 'issueState',
      render: (data: any, record: any) => {
        return <ItemState backgroundColor={data?.backgroundColor}>{data?.name}</ItemState>;
      },
    },
    {
      title: 'Category',
      dataIndex: ['projectIssueCategory'],
      key: 'issueCategory',
      render: (data: any, record: any) => {
        return <p>{data?.name}</p>;
      },
    },
    {
      title: 'Priority',
      dataIndex: ['priority'],
      key: 'issuePriority',
      render: (data: Priority, record: any) => {
        return <p>{TextPriority[data]}</p>;
      },
    },
    {
      title: 'Version',
      dataIndex: ['projectVersion'],
      key: 'issueVersion',
      render: (data: any, record: any) => {
        return <p>{data?.name}</p>;
      },
    },
    {
      title: 'Created',
      dataIndex: ['createdAt'],
      key: 'issueCreatedAt',
      render: (data: any, record: any) => {
        return <p>{moment(data).utcOffset(7).format('MMM DD, YYYY')}</p>;
      },
    },
    {
      title: 'Start Date',
      dataIndex: ['startDate'],
      key: 'issueStartDate',
      render: (data: any, record: any) => {
        return <p>{data ? moment(data).utcOffset(7).format('MMM DD, YYYY') : ''}</p>;
      },
    },
    {
      title: 'Due Date',
      dataIndex: ['dueDate'],
      key: 'issueDueDate',
      render: (data: any, record: any) => {
        return <p>{data ? moment(data).utcOffset(7).format('MMM DD, YYYY') : ''}</p>;
      },
    },
    {
      title: 'Estimated Hours',
      dataIndex: ['estimatedHours'],
      key: 'issueEstimatedHours',
      render: (data: any, record: any) => {
        return <p>{data ? Number(data) : ''}</p>;
      },
    },
    {
      title: 'Actual Hours',
      dataIndex: ['actualHours'],
      key: 'issueActualHours',
      render: (data: any, record: any) => {
        return <p>{data ? Number(data) : ''}</p>;
      },
    },
    {
      title: 'Updated',
      dataIndex: ['updatedAt'],
      key: 'issueUpdated',
      render: (data: any, record: any) => {
        return <p>{moment(data).format('MMM DD, YYYY')}</p>;
      },
    },
  ];
  return (
    <div className={styles.dashboardProjectIssues}>
      <div className={styles.topSearch}>
        <div className={styles.searchState}>
          {isLoadingState ? (
            <Spin />
          ) : (
            <dl style={{ display: 'flex' }}>
              <dd style={{ margin: '0px', fontWeight: '500', fontSize: '1.7rem' }}>State:</dd>
              {statesSearch?.map((item: IStatesSearch, index: number) => (
                <dd key={index} style={{ marginLeft: '10px' }}>
                  <button
                    type="button"
                    className={classNames(styles.itemState, { [styles.itemStateIsSearch]: item.isSearch })}
                    onClick={() => handleClickState(index)}
                  >
                    {item?.name}
                  </button>
                </dd>
              ))}
            </dl>
          )}
        </div>
        <div className={styles.searchOther}>
          <Select
            showSearch
            placeholder="Select a issue type"
            optionFilterProp="children"
            onChange={(value) => onChange(value, ChangeFillType.TYPE)}
            allowClear
            filterOption={(input, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            style={{ width: 200 }}
            options={projectIssueTypeQuery?.data?.map((item: any) => ({ value: item.id, label: item?.name }))}
          />{' '}
          <Select
            showSearch
            placeholder="Select a issue category"
            optionFilterProp="children"
            onChange={(value) => onChange(value, ChangeFillType.CATEGORY)}
            allowClear
            filterOption={(input, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            style={{ width: 200 }}
            options={projectIssueCategoriesQuery?.data?.map((item: { id: number; name: string }) => ({
              value: item.id,
              label: item.name,
            }))}
          />
          <Select
            showSearch
            placeholder="Select a issue version"
            optionFilterProp="children"
            onChange={(value) => onChange(value, ChangeFillType.VERSION)}
            allowClear
            filterOption={(input, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            style={{ width: 200 }}
            options={projectVersionQuery?.data?.map((item: { id: number; name: string }) => ({
              value: item.id,
              label: item.name,
            }))}
          />
          <Select
            showSearch
            placeholder="Assignee"
            optionFilterProp="children"
            onChange={(value) => onChange(value, ChangeFillType.ASSIGNEE)}
            allowClear
            filterOption={(input, option: any) => {
              return (option?.label.props.children[1].props.children ?? '').toLowerCase().includes(input.toLowerCase());
            }}
            style={{ width: 200, marginRight: '10px' }}
            size={'middle'}
            value={assigneeId}
            options={membersProjectQuery?.data?.map((item: any) => ({
              value: item.user.id,
              label: (
                <div>
                  <Avatar size={25} src={<img src={item.user.avatar50x50 ?? icons.HedLayer} alt="avatar" />} />
                  <span style={{ marginLeft: '10px' }}>{item.user?.name}</span>
                </div>
              ),
            }))}
          />
          <Avatar
            icon={<UserOutlined />}
            style={{ cursor: 'pointer', backgroundColor: assigneeId ? '#4caf93' : 'rgba(0, 0, 0, 0.25)' }}
            size={33}
            onClick={handleAssignMyself}
          />
          <Avatar
            icon={<ToolOutlined />}
            style={{
              cursor: 'pointer',
              marginLeft: '10px',
              backgroundColor: isCreated ? '#4caf93' : 'rgba(0, 0, 0, 0.25)',
            }}
            size={33}
            onClick={handleMyCreated}
          />
          <Input
            style={{ width: 200, marginLeft: '25px', borderRadius: '0px', height: '33px' }}
            placeholder="Enter keyword"
            onChange={handleKeyWord}
            // ref={inputRef}
          ></Input>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div>
          <Table
            dataSource={issuesProjectQuery?.data}
            pagination={false}
            columns={columns}
            style={{ marginBottom: '30px', cursor: 'pointer' }}
            loading={isLoadingIssue}
            scroll={{ x: 3000 }}
            onRow={(record) => {
              return {
                onClick: () => {
                  setIssueId(record.id);
                  setIsEdit(
                    ([UserProjectRole.SUB_PM].includes(userProject.role) &&
                      userProject.categoryIds?.includes(record.projectIssueCategory.id)) ||
                      [UserProjectRole.PM].includes(userProject.role) ||
                      record.createdBy === profile.id ||
                      record.assigneeId === profile.id,
                  );
                  showModalDetailIssue();
                  refetchDetailIssue();
                },
              };
            }}
          ></Table>
        </div>

        <div style={{ alignSelf: 'center' }}>
          <CustomPagination
            totalItems={issuesProjectQuery?.totalItems || 0}
            handleChangePage={handleChangePage}
            current={filterIssues.pageIndex}
            pageSize={filterIssues.pageSize}
            align={TextALign.Left}
          />
        </div>
      </div>

      <Modal
        title={
          <TitleIssueDetail>
            {project?.name} ({project?.key})
          </TitleIssueDetail>
        }
        centered
        open={openDetailIssue}
        onCancel={handleCancelDetailIssue}
        width={1300}
        footer={null}
      >
        {issueId && (
          <DetailIssue
            issueId={issueId}
            issueDetail={issueDetail}
            isEdit={isEdit}
            showModalDetailIssue={showModalDetailIssue}
            handleCancelDetailIssue={handleCancelDetailIssue}
            project={project}
            projectIssueStateQuery={projectIssueStateQuery}
            projectIssueCategoriesQuery={projectIssueCategoriesQuery}
            projectVersionQuery={projectVersionQuery}
            membersProjectQuery={membersProjectQuery}
            projectIssueTypeQuery={projectIssueTypeQuery}
          ></DetailIssue>
        )}
      </Modal>
    </div>
  );
}
