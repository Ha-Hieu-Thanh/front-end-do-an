import {
  projectIssueList
} from '@/api/client/project';
import queryKeys from '@/connstant/queryKeys';
import { CaretDownOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import styled from '@xstyled/styled-components';
import { Spin } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { useParams } from 'react-router';
import { ITask } from '.';
import styles from './styles.module.scss';
import Task from './task';
const Container = styled.divBox`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  width: 350px;
  display: flex;
  flex-direction: column;
`;
const Title = styled.h3Box`
  margin: 2px 80px;
  text-align: center;
  background: white;
  font-size: 1.5rem;
  border-radius: 20px;
`;

const TaskList = styled.divBox`
  padding: 8px;
  transition: background-color 0.2s ease;
  background-color: ${(props: any) => (props.isDraggingOver ? 'white' : 'white')};
  flex-grow: 1;
  overflow: auto;
`;


function Column(props: any) {
  const params = useParams();
  const projectId = Number(params.projectId);
  const [taskFormat, setTaskFormat] = useState<{ [key: string]: ITask }>({});
  const [pageIndex, setPageIndex] = useState<number>(1);
  const parentContainerRef = useRef<any>(null);
  const column = props.column;
  const { data: projectIssues, isLoading } = useQuery({
    queryKey: [`${queryKeys.projectIssueList}-${column.id}`, projectId, pageIndex, props.params],
    queryFn: () => projectIssueList({ stateIds: [column.id], pageIndex, ...props.params }),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (!projectIssues?.data) {
      return;
    }
    props.handleDataTasksByColumn(projectIssues?.data, column.id, pageIndex);
    setTaskFormat(
      Object.assign(
        taskFormat,
        projectIssues?.data.reduce((acc: any, cur: any) => {
          acc[cur.id] = cur;
          return acc;
        }, {}),
      ),
    );
  }, [projectIssues?.data]);

  return (
    <Container>
      <div style={{ backgroundColor: column.backgroundColor }}>
        <Title>{column.name}</Title>
      </div>

      {isLoading ? (
        <Spin />
      ) : (
        <Droppable droppableId={String(column.id)}>
          {(provided, snapshot) => (
            <TaskList
              // isDraggingOver={snapshot.isDraggingOver}
              ref={(el: any) => {
                provided.innerRef(el);
                // Lưu ý: Thêm đoạn này để sử dụng cả ref của parentContainerRef
                parentContainerRef.current = el;
              }}
              {...provided.droppableProps}
            >
              {props.dataTasksByColumn?.map((taskId: any, index: number) => (
                <Task
                  key={taskId}
                  task={taskFormat[taskId] || props?.dataTasks?.[taskId]}
                  index={index}
                  columnName={column.name}
                  totalItems={projectIssues?.totalItems}
                  projectIssueStateQuery={props.projectIssueStateQuery}
                  projectIssueCategoriesQuery={props.projectIssueCategoriesQuery}
                  projectVersionQuery={props.projectVersionQuery}
                  membersProjectQuery={props.membersProjectQuery}
                  projectIssueTypeQuery={props.projectIssueTypeQuery}
                  project={props.project}
                  userId={props.userId}
                />
              ))}
              {provided.placeholder}
              {projectIssues.hasMore && (
                <div
                  className={styles.CaretDownOutlined}
                  onClick={() => {
                    if (projectIssues.hasMore) {
                      setPageIndex(pageIndex + 1);
                    }
                  }}
                >
                  <CaretDownOutlined style={{ fontSize: '25px', color: '#4caf93' }} />
                </div>
              )}
            </TaskList>
          )}
        </Droppable>
      )}
    </Container>
  );
}
export default memo(Column);
