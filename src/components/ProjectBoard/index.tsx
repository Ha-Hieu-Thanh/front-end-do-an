import {
  IUpdateIssue,
  membersProject,
  projectIssueCategories,
  projectIssueState,
  projectIssueTypes,
  projectIssueVersion,
  projectUpdateIssue,
  projectVersion,
} from '@/api/client/project';
import queryKeys from '@/connstant/queryKeys';
import { handleErrorMessage } from '@/i18n';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Modal, Select, Spin } from 'antd';
import classNames from 'classnames';
import { lazy, memo, useCallback, useEffect, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useParams } from 'react-router';
import styles from './styles.module.scss';
import useGetProjectDetail, { IDetailProject } from '@/utils/hooks/useGetDetailProject';
import { PlusOutlined, UserOutlined, ToolOutlined } from '@ant-design/icons';
import { UserProjectStatus } from '@/connstant/enum/common';
import useProfileClient from '@/utils/hooks/useProfileClient';
import styled from '@xstyled/styled-components';
import icons from '@/assets/icons';

const DashboardProjectAddIssue = lazy(() => import('@/components/ProjectAddIssue'));
const Column = lazy(() => import('./column'));

const Container = styled.divBox`
  display: flex;
  // overflow-x: auto;
  width: max-content;
  justify-content: space-around;
  height: 73vh;
`;
export interface IState {
  backgroundColor: string;
  description: string;
  id: number;
  issueCount: number;
  name: string;
  order: number;
  taskIds: number[];
}
export enum ChangeFillType {
  TYPE = 1,
  CATEGORY = 2,
  VERSION = 3,
  ASSIGNEE = 4,
}
export interface ITask {
  id: number;
  subject: string;
  stateId: number;
  order: number;
  priority: number;
  startDate: string;
  dueDate: string;
  estimatedHours: null;
  actualHours: null;
  projectIssueType: {
    id: number;
    name: string;
    backgroundColor: string;
  };
  projectIssueCategory: {
    id: number;
    name: string;
  };
  projectVersion: {
    id: number;
    name: string;
  };
  assignee: {
    id: number;
    name: string;
    avatar: string;
    avatar50x50: string;
    avatar400x400: string;
    origin: string;
  };
}
function DashboardProjectBoard() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data } = useGetProjectDetail();
  const project = data?.data as IDetailProject;
  const queryClient = useQueryClient();
  const [isModalOpenAddIssue, setIsModalOpenAddIssue] = useState(false);
  const [typeId, setTypeId] = useState<ChangeFillType | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<ChangeFillType | undefined>(undefined);
  const [versionId, setVersionId] = useState<ChangeFillType | undefined>(undefined);
  const [assigneeId, setAssigneeId] = useState<ChangeFillType | undefined>(undefined);
  const [isCreated, setsIsCreated] = useState<boolean>(false);
  const { profile } = useProfileClient(true);

  const modelAddIssue = {
    showModalAddIssue: () => {
      setIsModalOpenAddIssue(true);
    },
    handleOkAddIssue: () => {
      setIsModalOpenAddIssue(false);
    },
    handleCancelAddIssue: () => {
      setIsModalOpenAddIssue(false);
    },
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

  const onSearch = (value: string) => {
    console.log('search:', value);
  };

  const updateIssueMutation = useMutation({
    mutationFn: (variables: { issueId: number; payload: IUpdateIssue }) =>
      projectUpdateIssue(variables.issueId, variables.payload),
  });

  const { data: projectIssueStateQuery, isLoading } = useQuery({
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

  const [states, setStates] = useState<IState[] | null>(null);
  const [dataTasksByColumn, setDataTasksByColumn] = useState<{ [key: number]: number[] }>({});
  const [dataTasks, setDataTasks] = useState<{ [key: string]: ITask }>({});

  useEffect(() => {
    setStates(projectIssueStateQuery?.data);
  }, [projectIssueStateQuery?.data]);

  const handleDataTasksByColumn = useCallback(
    (tasks: ITask[], stateId: number, pageIndex: number) => {
      const { format, dataTaskNew } = tasks.reduce(
        (acc: any, cur) => {
          if (!acc.format.length) acc.format = [];
          acc.format.push(cur.id);
          acc.dataTaskNew[cur.id] = cur;
          return acc;
        },
        { format: [], dataTaskNew: {} },
      );
      setDataTasks(Object.assign(dataTasks, dataTaskNew));
      if (pageIndex === 1) {
        setDataTasksByColumn((pre) => JSON.parse(JSON.stringify(Object.assign(pre, { [stateId]: format }))));
      } else {
        setDataTasksByColumn((pre) =>
          JSON.parse(
            JSON.stringify(
              Object.assign(pre, { [stateId]: Array.from(new Set([...(pre?.[stateId] || []), ...format])) }),
            ),
          ),
        );
      }
    },
    [dataTasksByColumn, dataTasks],
  );
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    const { index: indexUpdate, droppableId: stateIdUpdate } = destination;
    const { index: indexItem, droppableId: stateIdItem } = source;

    let issuePostId: number = 0;
    const listColumnUpdate = [] as string[];

    if (stateIdUpdate !== stateIdItem) {
      listColumnUpdate.push(stateIdUpdate, stateIdItem);
      if (indexUpdate === 0) {
        issuePostId = -1;
      } else {
        issuePostId = dataTasksByColumn[stateIdUpdate]?.[indexUpdate - 1];
      }
    }
    if (stateIdUpdate === stateIdItem) {
      listColumnUpdate.push(stateIdUpdate);
      issuePostId =
        indexItem < indexUpdate
          ? dataTasksByColumn[stateIdUpdate]?.[indexUpdate]
          : dataTasksByColumn[stateIdUpdate]?.[indexUpdate - 1] || -1;
    }
    const start = dataTasksByColumn[Number(stateIdItem)];
    const finish = dataTasksByColumn[Number(stateIdUpdate)];
    if (start === finish) {
      const newTaskIds = Array.from(start);
      newTaskIds.splice(indexItem, 1);
      newTaskIds.splice(indexUpdate, 0, Number(draggableId));
      setDataTasksByColumn((pre) => Object.assign(pre, { [stateIdItem]: newTaskIds }));
    } else {
      // Moving from one list to another

      const startTaskIds = Array.from(start || []);
      startTaskIds.splice(indexItem, 1);

      const finishTaskIds = Array.from(finish || []);
      finishTaskIds.splice(indexUpdate, 0, Number(draggableId));

      // setDataTasksByColumn((pre) =>
      //   Object.assign(pre, { [stateIdItem]: startTaskIds, [stateIdUpdate]: finishTaskIds }),
      // );
      setDataTasksByColumn({ ...dataTasksByColumn, [stateIdItem]: startTaskIds, [stateIdUpdate]: finishTaskIds });
    }

    if (issuePostId) {
      const variables = { issueId: Number(draggableId), payload: { issuePostId, stateId: Number(stateIdUpdate) } };
      const queryUpdate = listColumnUpdate.map((stateId) => `${queryKeys.projectIssueList}-${stateId}`);
      updateIssueMutation.mutate(variables, {
        onSuccess: () => {
          queryUpdate.map((item) => queryClient.invalidateQueries([item]));
        },
        onError: (error) => {
          handleErrorMessage(error);
        },
      });
    }
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

  return (
    <div className={classNames(styles.dashboardProjectBoard)}>
      {isLoading && states ? (
        <Spin />
      ) : (
        <>
          <div className={styles.dashboardProjectBoardTop}>
            <div className={styles.dashboardProjectHeader}>
              <h4>Board</h4>
              <button onClick={modelAddIssue.showModalAddIssue}>
                <PlusOutlined /> Add Issue
              </button>
            </div>
            <div className={styles.dashboardProjectBottom}>
              <Select
                showSearch
                placeholder="Select a issue type"
                optionFilterProp="children"
                onChange={(value) => onChange(value, ChangeFillType.TYPE)}
                onSearch={onSearch}
                allowClear
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                style={{ width: 200 }}
                options={project?.projectIssueTypes?.map((item) => ({ value: item.id, label: item.name }))}
              />
              <Select
                showSearch
                placeholder="Select a issue category"
                optionFilterProp="children"
                onChange={(value) => onChange(value, ChangeFillType.CATEGORY)}
                onSearch={onSearch}
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
                onSearch={onSearch}
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
                  return (option?.label.props.children[1].props.children ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
                style={{ width: 200, marginRight: '10px' }}
                size={'middle'}
                value={assigneeId}
                options={membersProjectQuery?.data?.map((item: any) => ({
                  value: item.user.id,
                  label: (
                    <div>
                      <Avatar size={25} src={<img src={item.user.avatar50x50 ?? icons.HedLayer} alt="avatar" />} />
                      <span style={{ marginLeft: '10px' }}>{item.user.name || item.user.email}</span>
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
            </div>
          </div>
          <div className={styles.dashboardProjectBoardBody}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Container>
                {states?.map((state) => {
                  return (
                    <Column
                      key={state?.id}
                      column={state}
                      handleDataTasksByColumn={handleDataTasksByColumn}
                      dataTasksByColumn={dataTasksByColumn[Number(state.id)]}
                      dataTasks={dataTasks}
                      params={{ typeId, categoryId, versionId, assigneeId, isCreated }}
                      projectIssueStateQuery={projectIssueStateQuery}
                      projectIssueCategoriesQuery={projectIssueCategoriesQuery}
                      projectVersionQuery={projectVersionQuery}
                      membersProjectQuery={membersProjectQuery}
                      projectIssueTypeQuery={projectIssueTypeQuery}
                      project={project}
                      userId={profile?.id}
                    />
                  );
                })}
              </Container>
            </DragDropContext>
          </div>
        </>
      )}
      <Modal open={isModalOpenAddIssue} onCancel={modelAddIssue.handleCancelAddIssue} width={1300} footer={null}>
        <DashboardProjectAddIssue handleOkAddIssue={modelAddIssue.handleOkAddIssue}></DashboardProjectAddIssue>
      </Modal>
    </div>
  );
}
export default memo(DashboardProjectBoard);
