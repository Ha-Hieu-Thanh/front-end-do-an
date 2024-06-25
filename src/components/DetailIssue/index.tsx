import {
  createProjectIssueComment,
  getIssueDetail,
  getProjectIssueComment,
  getProjectIssueHistory,
  issueDetail,
  membersProject,
} from '@/api/client/project';
import { IFilterStaff, IssueHistoryType, PAGE_INDEX, TextPriority, UserProjectStatus } from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import { IDetailProject } from '@/utils/hooks/useGetDetailProject';
import { EditOutlined } from '@ant-design/icons';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import styled, { container } from '@xstyled/styled-components';
import { Avatar, List, Modal } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import { lazy, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './styles.module.scss';
import './mention.style.scss';
import socket from '@/utils/socket';
import { ConversationEvent } from '@/utils/socket/socket.type';
import 'quill-mention';
import { uploadFile } from '@/api/client/upload';
import icons from '@/assets/icons';
import CollapsibleContent from './CollapsibleContent';

const EditIssue = lazy(() => import('@/components/EditIssue'));

export const initialStaff: IFilterStaff = {
  pageSize: 100,
  pageIndex: PAGE_INDEX,
  status: [UserProjectStatus.ACTIVE],
};

const ItemType = styled.spanBox`
  color: white;
  background-color: ${(props: any) => props.backgroundColor};
  border-radius: 20px;
  padding: 1px 10px;
  margin-right: 5px;
`;
const ItemState = styled.spanBox`
  color: white;
  background-color: ${(props: any) => props.backgroundColor};
  border-radius: 20px;
  padding: 1px 10px;
`;
const ItemId = styled.spanBox`
  font-weight: 500;
  color: rgb(0, 131, 107);
`;
const IssueHeaderDetail = styled.divBox``;
const IHDTop = styled.divBox`
  display: flex;
  justify-content: space-between;
`;
const IHDBottom = styled.divBox`
  display: flex;
  justify-content: space-between;
  padding: 25px 0px 15px 0px;
`;
const Subject = styled.pBox`
  font-weight: 600;
  margin: 0px;
  font-size: 2.2rem;
`;
const ItemData = styled.divBox`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  text-align: center;
  padding: 13px 0px;
  border-bottom: 1px solid #bdbdbd;
  padding-right: 40%;
`;
const TitleIssueDetail = styled.divBox`
  font-size: 2rem;
  font-weight: 500;
  padding: 5px 0px;
`;
enum viewType {
  History = 1,
  Comment = 2,
}

export default function IssueDetail({
  issueId,
  issueDetail,
  showModalDetailIssue,
  handleCancelDetailIssue,
  project,
  projectIssueStateQuery,
  projectIssueCategoriesQuery,
  projectVersionQuery,
  membersProjectQuery,
  projectIssueTypeQuery,
  isEdit,
}: {
  issueId: number;
  issueDetail?:
    | {
        data: issueDetail;
      }
    | undefined;
  showModalDetailIssue: () => void;
  handleCancelDetailIssue: () => void;
  project: IDetailProject;
  projectIssueStateQuery: any;
  projectIssueCategoriesQuery: any;
  projectVersionQuery: any;
  membersProjectQuery: any;
  projectIssueTypeQuery: any;
  isEdit?: boolean;
}) {
  const queryClient = useQueryClient();
  const [filterStaff, setFilterStaff] = useState<IFilterStaff>(initialStaff);

  const [openEditIssue, setOpenEditIssue] = useState(false);

  const [view, setView] = useState<viewType>(viewType.History);

  const { data: membersProjectList } = useQuery({
    queryKey: [queryKeys.membersProject, { ...filterStaff }, project?.id],
    queryFn: () => membersProject({ ...filterStaff }),
    keepPreviousData: true,
    enabled: project?.id !== undefined,
  });

  const quillRef = useRef(null);
  const handleKeyDown = (event: any) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (quillRef.current) {
        const mentionModule = (quillRef.current as any).getEditor().getModule('mention');
        if (mentionModule) {
          const index = mentionModule.activeItemIndex;
          const items = document.querySelectorAll('.ql-mention-list-item');
          if (event.key === 'ArrowUp' && index > 0) {
            mentionModule.activeItemIndex = index - 1;
            items[index - 1].classList.add('selected');
            mentionModule.showItemList();
          } else if (event.key === 'ArrowDown' && index < items.length - 1) {
            mentionModule.activeItemIndex = index + 1;
            items[index + 1].classList.add('selected');
            mentionModule.showItemList();
          }
          event.preventDefault();
        }
      }
    }
  };

  const showModalEditIssue = useCallback(() => {
    setOpenEditIssue(true);
  }, []);
  const handleCancelEditIssue = useCallback(() => {
    setOpenEditIssue(false);
  }, []);

  const handleEditIssue = () => {
    if (isEdit) {
      handleCancelDetailIssue();
      showModalEditIssue();
    }
  };

  const { data: issueHistoryData } = useQuery({
    queryKey: [queryKeys.projectIssueHistory, project?.id, issueId],
    queryFn: () => getProjectIssueHistory({ pageSize: 10, issueId }),
    keepPreviousData: true,
    enabled: project?.id !== undefined && issueId !== undefined,
  });

  const {
    data: issueCommentData,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [queryKeys.projectIssueComment, project?.id, issueId],
    queryFn: async ({ pageParam }) => getProjectIssueComment(issueId, { pageSize: 5, pageIndex: pageParam }),
    keepPreviousData: true,
    enabled: project?.id !== undefined && issueId !== undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      if (lastPage.hasMore) {
        return lastPage.pageIndex + 1; // Increment pageIndex for next page
      }
      return undefined;
    },
  });

  // create comment
  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createProjectIssueComment(issueId, { content }),
  });

  // handle create comment mutation
  const handleCreateComment = (content: string) => {
    createCommentMutation.mutate(content, {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.projectIssueComment, project?.id, issueId]);
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  useEffect(() => {
    // push event to socket
    socket.emit(ConversationEvent.JOIN_ISSUE_COMMENT, issueId, (data: any) => {
      return;
    });

    socket.on('NEW_COMMENT', (data) => {
      queryClient.invalidateQueries([queryKeys.projectIssueComment, project?.id, issueId]);
    });
    return () => {
      socket.off('NEW_COMMENT');
      socket.emit('LEAVE_ISSUE_COMMENT', { issueId });
    };
  }, []);

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

  const mentionConfig = useMemo(() => {
    return {
      dataAttributes: ['userId'],
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['@', '#'],
      offsetTop: 0,
      source: function (searchTerm: any, renderList: any, mentionChar: any) {
        const values = membersProjectList.data.map((item: any) => {
          return {
            ...item,
            value: item.user.name || item.user.email,
          };
        });
        if (searchTerm.length === 0) renderList(values, searchTerm);
        else {
          if (searchTerm.startsWith(' ')) renderList([], searchTerm); // prevent mention when user type space
          else {
            const matches = [];
            for (let i = 0; i < membersProjectList.data.length; i++)
              if (values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) matches.push(values[i]);
            renderList(matches, searchTerm);
          }
        }
      },
      renderItem: function (item: any, searchTerm: any) {
        const mentionElement = document.createElement('span');
        mentionElement.className = 'mention-name';
        mentionElement.textContent = item.user.name || item.user.email;
        return mentionElement;
      },
    };
  }, [membersProjectList?.data]);

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ header: '1' }, { header: '2' }, { font: [] }],
          // size 14px 20px 24px
          [{ size: [] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'video'],
          ['clean'],
          ['code-block'],
        ],
        handlers: {
          image: async function () {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();
            input.onchange = async () => {
              const file = input.files?.[0];
              if (file) {
                const response = await uploadFile(file);
                const url = response.data.domain + '/' + response.data.results[0];
                console.log({ url });
                const quill = (quillRef.current as any).getEditor();
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', url);
                // style for image
                const img = quill.container.querySelector('img[src="' + url + '"]');
                img.style.width = '50%';
                img.style.height = 'auto';

                quill.setSelection(range.index + 1);
              }
            };
          },
        },
      },
      mention: mentionConfig,

      // handle upload file call api
    };
  }, [mentionConfig]);

  return (
    <div className={styles.issueDetail}>
      <IssueHeaderDetail className={styles.issueHeaderDetail}>
        <IHDTop>
          <div>
            <ItemType backgroundColor={issueDetail?.data?.type?.backgroundColor}>
              {issueDetail?.data?.type?.name}
            </ItemType>
            <ItemId>
              {project?.key}-{issueDetail?.data?.id}
            </ItemId>
          </div>
          <div>
            <span style={{ marginRight: '20px' }}>Start Date - {issueDetail?.data?.startDate}</span>
            <span style={{ marginRight: '20px' }}>Due Date - {issueDetail?.data?.dueDate}</span>
            <ItemState backgroundColor={issueDetail?.data?.state?.backgroundColor}>
              {issueDetail?.data?.state?.name}
            </ItemState>
          </div>
        </IHDTop>
        <IHDBottom>
          <Subject style={{ width: '75%' }}>{issueDetail?.data?.subject}</Subject>
          <div
            style={{
              width: '25%',
              display: 'flex',
              justifyContent: 'end',
              alignItems: 'center',
              wordSpacing: '5px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <div
              className={styles.edit}
              style={{
                borderRadius: '20px',
                border: 'solid 1px #adadad',
                padding: '5px 15px',
                cursor: isEdit ? 'pointer' : 'not-allowed',
              }}
              onClick={handleEditIssue}
            >
              <EditOutlined /> <span>Edit</span>
            </div>
          </div>
        </IHDBottom>
      </IssueHeaderDetail>
      <div className={styles.issueBodyDetail}>
        <div>
          <div style={{ display: 'flex' }}>
            <Avatar size={40} src={issueDetail?.data?.created?.avatar50x50 ?? icons.HedLayer} />
            <div style={{ marginLeft: '10px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '600' }}>{issueDetail?.data?.created?.name}</div>
              <div>Created {moment(issueDetail?.data?.createdAt).format('MMM. DD, YYYY HH:mm:ss')}</div>
            </div>
          </div>

          <div style={{ padding: '15px 0px' }}>
            <ReactQuill value={issueDetail?.data?.description || ''} readOnly={true} theme={'bubble'} />
          </div>

          <div style={{ width: '100%' }}>
            <ItemData style={{ borderTop: '1px solid #bdbdbd' }}>
              <div>Priority</div>
              {issueDetail?.data?.priority && (
                <div
                  style={{
                    color: '#00836b',
                    padding: '0 4px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(44,154,122,.06)',
                  }}
                >
                  {TextPriority[issueDetail?.data?.priority]}
                </div>
              )}
            </ItemData>
            <ItemData>
              <div>Assignee</div>
              {issueDetail?.data?.assignee && (
                <div>
                  <Avatar size={35} src={issueDetail?.data?.assignee?.avatar400x400 ?? icons.HedLayer} />
                  <span style={{ marginLeft: '10px', fontSize: '1.6rem', fontWeight: '600' }}>
                    {issueDetail?.data?.assignee?.name}
                  </span>
                </div>
              )}
            </ItemData>
            <ItemData>
              <div>Category</div>
              {issueDetail?.data?.category?.name && <div>{issueDetail?.data?.category?.name}</div>}
            </ItemData>
            <ItemData>
              <div>Version</div>
              {issueDetail?.data?.version?.name && <div>{issueDetail?.data?.version?.name}</div>}
            </ItemData>
            <ItemData>
              <div>Estimated Hours</div>
              {issueDetail?.data?.estimatedHours && <div>{issueDetail?.data?.estimatedHours}</div>}
            </ItemData>
            <ItemData>
              <div>Actual Hours</div>
              {issueDetail?.data?.actualHours && <div>{issueDetail?.data?.actualHours}</div>}
            </ItemData>
          </div>
        </div>
      </div>

      <div className={styles.issueBottomDetail}>
        <div>
          <span style={{ fontWeight: '600', fontSize: '1.6rem' }}>View: </span>
          <span
            style={{ marginLeft: '20px' }}
            className={classNames(view === viewType.History && styles.isView, styles.view)}
            onClick={() => setView(viewType.History)}
          >
            Show histories
          </span>
          <span
            style={{ marginLeft: '20px' }}
            className={classNames(view === viewType.Comment && styles.isView, styles.view)}
            onClick={() => setView(viewType.Comment)}
          >
            Show comments
          </span>
        </div>
        <div className={styles.issueHistory}>
          {view === viewType.History && (
            <div>
              <List
                itemLayout="horizontal"
                dataSource={issueHistoryData?.data}
                renderItem={(item: any, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar size={35} src={item?.created?.avatar400x400 ?? icons.HedLayer} />}
                      title={
                        <div>
                          <p style={{ margin: '0px' }}>{item?.created?.name}</p>
                          <p style={{ margin: '0px', fontWeight: '400' }}>
                            {item?.type === IssueHistoryType.CREATE ? 'Create' : 'Update'} -{' '}
                            {moment(item?.createdAt).format('MMM. DD, YYYY HH:mm:ss')}
                          </p>
                        </div>
                      }
                      description={contentIssueHistory(item?.type, item?.metadata)}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
          {view === viewType.Comment && (
            <div style={{ position: 'relative' }}>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                placeholder="Write a comment..."
                modules={modules}
                onKeyDown={handleKeyDown}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'right',
                  alignItems: 'center',
                  padding: '10px 0px',
                }}
              >
                <button
                  className="btn btn-green"
                  style={{
                    padding: '5px 15px',
                    borderRadius: '5px',
                    border: 'solid 1px #adadad',
                    cursor: 'pointer',
                  }}
                  // onClick={() => handleCreateComment(editorHtml)}
                  // get content from Quill
                  onClick={() => {
                    if (quillRef.current) {
                      const quill = (quillRef.current as any).getEditor();
                      let html = quill.root.innerHTML;
                      handleCreateComment(html);
                      quill.root.innerHTML = '';
                    }
                  }}
                >
                  Submit
                </button>
              </div>
              <List
                itemLayout="horizontal"
                dataSource={issueCommentData?.pages.map((page) => page.data).flat()}
                renderItem={(item: any, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={item.user.avatar50x50 ?? icons.HedLayer} />}
                      title={
                        <div>
                          <p style={{ margin: '0px' }}>{item.user.name || item.user.email}</p>
                          <p style={{ margin: '0px', fontWeight: '400' }}>
                            {moment(item.createdAt).format('MMM. DD, YYYY HH:mm:ss')}
                          </p>
                        </div>
                      }
                      description={
                        <div style={{ color: 'black' }}>
                          <CollapsibleContent content={item.content} />
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
              {hasNextPage && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '10px 0px',
                  }}
                >
                  <button
                    className="btn btn-green"
                    style={{
                      borderRadius: '5px',
                      border: 'solid 1px #adadad',
                      width: '100%',
                      cursor: 'pointer',
                    }}
                    onClick={() => fetchNextPage()}
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        title={
          <TitleIssueDetail>
            {project?.name} ({project?.key})
          </TitleIssueDetail>
        }
        centered
        open={openEditIssue}
        onCancel={handleCancelEditIssue}
        width={1300}
        footer={null}
        style={{ padding: '0px' }}
      >
        {issueDetail && (
          <EditIssue
            issueId={issueId}
            projectIssueStateQuery={projectIssueStateQuery}
            projectIssueCategoriesQuery={projectIssueCategoriesQuery}
            projectVersionQuery={projectVersionQuery}
            membersProjectQuery={membersProjectQuery}
            projectIssueTypeQuery={projectIssueTypeQuery}
            issueDetail={issueDetail}
            handleCancelEditIssue={handleCancelEditIssue}
            showModalDetailIssue={showModalDetailIssue}
          ></EditIssue>
        )}
      </Modal>
    </div>
  );
}
