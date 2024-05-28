import { getIssueDetail } from '@/api/client/project';
import icons from '@/assets/icons';
import { UserProjectRole } from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import { FireTwoTone, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import styled from '@xstyled/styled-components';
import { Avatar, Modal } from 'antd';
import { lazy, useState, useCallback } from 'react';
import { Draggable } from 'react-beautiful-dnd';
const DetailIssue = lazy(() => import('@/components/DetailIssue'));

const Container = styled.divBox`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: ${(props: any) => (props.isDragging ? 'white' : 'white')};
  &:hover {
    ${(props: any) => (props.isEdit ? 'cursor: grab;' : 'cursor: pointer;')}
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.35);
    }
  }
`;
const Item = styled.divBox``;
const ItemTop = styled.divBox`
  outline-width: 0px;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  margin-bottom: 5px;
`;
const ItemType = styled.spanBox`
  color: white;
  background-color: ${(props: any) => props.backgroundColor};
  border-radius: 20px;
  padding: 1px 10px;
`;
const ItemId = styled.spanBox`
  font-weight: 600;
  color: rgb(0, 131, 107);
`;
const ItemDueDate = styled.spanBox`
  font-size: 1.3rem;
  font-weight: 400;
  margin-left: 10px;
`;
const ItemSubject = styled.divBox`
  font-size: 1.5rem;
  font-weight: 500;
  word-wrap: break-word;
`;
const ItemTFooter = styled.divBox`
  outline-width: 0px;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  margin-bottom: 5px;
`;
export const TitleIssueDetail = styled.divBox`
  font-size: 2rem;
  font-weight: 500;
  padding: 5px 0px;
`;

export default function Task(props: any) {
  const [openDetailIssue, setOpenDetailIssue] = useState(false);

  const showModalDetailIssue = useCallback(() => {
    setOpenDetailIssue(true);
  }, []);
  const handleCancelDetailIssue = useCallback(() => {
    setOpenDetailIssue(false);
  }, []);

  const isEdit =
    ([UserProjectRole.SUB_PM].includes(props.project?.userProject?.role) &&
      props.project?.userProject?.categoryIds?.includes(props.task.projectIssueCategory.id)) ||
    [UserProjectRole.PM].includes(props.project?.userProject?.role) ||
    props.userId === props.task.createdBy ||
    props.userId === props.task.assigneeId;

  const { data: issueDetail } = useQuery({
    queryKey: [queryKeys.issueDetail, props.task.id],
    queryFn: () => getIssueDetail(props.task.id),
    enabled: props.task.id !== undefined,
  });
  return (
    <>
      <Draggable draggableId={String(props.task.id)} index={props.index} isDragDisabled={!isEdit}>
        {(provided, snapshot) => (
          <Container
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            // isDragging={snapshot.isDragging}
            onClick={showModalDetailIssue}
            isEdit={isEdit}
          >
            {
              <Item>
                <ItemTop>
                  <ItemType backgroundColor={props.task?.projectIssueType?.backgroundColor}>
                    {props.task?.projectIssueType?.name}
                  </ItemType>
                  <ItemId>
                    {props?.project?.key}-{props.task?.id}
                  </ItemId>
                </ItemTop>
                <ItemSubject>{props.task.subject}</ItemSubject>
                <ItemTFooter>
                  <div title={props.task?.assignee?.name}>
                    {props.task?.assignee?.avatar50x50 ? (
                      <Avatar
                        size={30}
                        src={<img src={props.task?.assignee?.avatar50x50 ?? icons.HedLayer} alt="avatar" />}
                      />
                    ) : (
                      <Avatar size={30} icon={<UserOutlined />} />
                    )}
                  </div>
                  <div style={{ alignItems: 'center', display: 'flex', WebkitAlignContent: 'center' }}>
                    {props.task?.dueDate &&
                    props.columnName !== 'Closed' &&
                    props.task.dueDate <= new Date().toISOString().slice(0, 10) ? (
                      <>
                        <FireTwoTone twoToneColor="#f42858" />
                        <ItemDueDate>{props.task?.dueDate}</ItemDueDate>
                      </>
                    ) : (
                      <ItemDueDate>{props.task?.dueDate}</ItemDueDate>
                    )}
                  </div>
                </ItemTFooter>
              </Item>
            }
          </Container>
        )}
      </Draggable>
      <Modal
        title={
          <TitleIssueDetail>
            {props.project.name} ({props.project.key})
          </TitleIssueDetail>
        }
        centered
        open={openDetailIssue}
        onCancel={handleCancelDetailIssue}
        width={1300}
        footer={null}
      >
        <DetailIssue
          issueId={props.task.id}
          issueDetail={issueDetail}
          showModalDetailIssue={showModalDetailIssue}
          handleCancelDetailIssue={handleCancelDetailIssue}
          project={props.project}
          projectIssueStateQuery={props.projectIssueStateQuery}
          projectIssueCategoriesQuery={props.projectIssueCategoriesQuery}
          projectVersionQuery={props.projectVersionQuery}
          membersProjectQuery={props.membersProjectQuery}
          projectIssueTypeQuery={props.projectIssueTypeQuery}
          isEdit={isEdit}
        ></DetailIssue>
      </Modal>
    </>
  );
}
