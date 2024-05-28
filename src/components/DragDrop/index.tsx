import {
  DragDropType,
  ProjectIssueCategoryStatus,
  ProjectIssueTypeStatus,
  ProjectVersionStatus,
} from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import { handleErrorMessage } from '@/i18n';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { handleSuccessMessage } from '@/utils/helper/common';
import moment from 'moment';
export default function DragAndDropList({
  items,
  updateMutation,
  type,
}: {
  items: any;
  updateMutation: any;
  type: DragDropType;
}) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [list, setList] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    setList(items);
  }, [items]);

  const handleDragStart = (e: any, index: any) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: any, index: any) => {
    e.preventDefault();

    const newList = [...list];
    const draggedOverItem = newList[index];

    if (draggedItem !== null) {
      const itemToMove = newList[draggedItem];
      newList.splice(draggedItem, 1);
      newList.splice(index, 0, itemToMove);
      setDraggedItem(index);
      setList(newList);
    }
  };

  const handleDragEnd = (id: number, index: number) => {
    if (draggedItem !== null && draggedItem !== index) {
      const item = list[draggedItem] as any;
      const postItem = list[draggedItem - 1] as any;
      const preItem = list[draggedItem + 1] as any;

      const objectHandle = {
        [DragDropType.ISSUE_TYPE]: {
          params: {
            projectIssueTypeId: item?.id,
            projectIssueTypePostId: postItem?.id,
            projectIssueTypePreId: preItem?.id,
          },
          queryClear: () => {
            queryClient.invalidateQueries([queryKeys.projectIssueTypes]);
          },
        },
        [DragDropType.ISSUE_CATEGORY]: {
          params: {
            projectIssueCategoryId: item?.id,
            projectIssueCategoryPostId: postItem?.id,
            projectIssueCategoryPreId: preItem?.id,
          },
          queryClear: () => {
            queryClient.invalidateQueries([queryKeys.projectIssueCategories]);
          },
        },
        [DragDropType.VERSION]: {
          params: {
            projectVersionId: item?.id,
            projectVersionPostId: postItem?.id,
            projectVersionPreId: preItem?.id,
          },
          queryClear: () => {
            queryClient.invalidateQueries([queryKeys.projectVersion]);
          },
        },
        [DragDropType.STATE]: {
          params: {
            projectIssueStateId: item?.id,
            projectIssueStatePostId: postItem?.id,
            projectIssueStatePreId: preItem?.id,
          },
          queryClear: () => {
            queryClient.invalidateQueries([queryKeys.projectVersion]);
          },
        },
      };

      const data = objectHandle[type];

      updateMutation.mutate(data.params, {
        onSuccess: () => {
          data.queryClear();
        },
        onError: (error: any) => {
          handleErrorMessage(error);
        },
      });
    }
    setDraggedItem(null);
  };

  const handleRemove = (id: number) => {
    const objectHandle = {
      [DragDropType.ISSUE_TYPE]: {
        params: {
          projectIssueTypeId: id,
          status: ProjectIssueTypeStatus.IN_ACTIVE,
        },
        queryClear: () => {
          queryClient.invalidateQueries([queryKeys.projectIssueTypes]);
        },
      },
      [DragDropType.ISSUE_CATEGORY]: {
        params: {
          projectIssueCategoryId: id,
          status: ProjectIssueCategoryStatus.IN_ACTIVE,
        },
        queryClear: () => {
          queryClient.invalidateQueries([queryKeys.projectIssueCategories]);
        },
      },
      [DragDropType.VERSION]: {
        params: {
          projectVersionId: id,
          status: ProjectVersionStatus.IN_ACTIVE,
        },
        queryClear: () => {
          queryClient.invalidateQueries([queryKeys.projectVersion]);
        },
      },
      [DragDropType.STATE]: {
        params: {
          projectIssueStateId: id,
          status: ProjectVersionStatus.IN_ACTIVE,
        },
        queryClear: () => {
          queryClient.invalidateQueries([queryKeys.projectIssueState]);
        },
      },
    };
    const data = objectHandle[type];
    updateMutation.mutate(data.params, {
      onSuccess: () => {
        handleSuccessMessage('Update success!');
        data.queryClear();
      },
      onError: (error: any) => {
        handleErrorMessage(error);
      },
    });
  };
  return (
    <div>
      <ul style={{ listStyle: 'none', padding: '0px' }}>
        {list.map((item: any, index: any) => (
          <li key={index} style={{ padding: '10px 10px', border: '1px solid black', marginBottom: '2px' }}>
            <div style={{ display: 'flex', fontSize: '1.5rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <DragOutlined
                  className={index === draggedItem ? styles.dragged : ''}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={() => handleDragEnd(item.id, index)}
                  style={{
                    cursor: 'move',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                />
                <span style={{ color: '#00836b', margin: '0px 30px 0px 20px' }}>{item.name}</span>

                {item.backgroundColor && (
                  <span
                    style={{
                      backgroundColor: item.backgroundColor,
                      color: '#ffffff',
                      padding: '0px 5px',
                      borderRadius: '20px',
                      marginRight: '10px',
                    }}
                  >
                    {item.name}
                  </span>
                )}
                <span style={{marginRight: '10px'}}>({item.issueCount})</span>
                {item.startDate ? <span style={{marginRight: '10px'}}>start date: {moment(item.startDate).format('YYYY-MM-DD')}</span> : <></>}
                {item.endDate ? <span style={{marginRight: '10px'}}>end date: {moment(item.endDate).format('YYYY-MM-DD')}</span> : <></>}
              </div>
              <div>
                <DeleteOutlined
                  style={{ alignContent: 'end', cursor: !item.issueCount ? 'pointer' : 'not-allowed' }}
                  onClick={() => {
                    if (!item.issueCount) {
                      handleRemove(item.id);
                    }
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p style={{ marginBottom: '0px', fontSize: '1.3rem' }}>
        Drag <DragOutlined /> to rearrange order. Number in parentheses indicates the number of issues belonging to the
        type.
      </p>
    </div>
  );
}
