import { IAddWikiProject, addWikiProject, getListWikiProject, updateWikiProject } from '@/api/client/project';
import queryKeys from '@/connstant/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Col, Form, Input, Modal, Row, Spin } from 'antd';
import classNames from 'classnames';
import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useParams } from 'react-router-dom';
import styles from './styles.module.scss';
import { Message } from '@/connstant/enum/common';
import { convertUTCToGMTPlus7, handleSuccessMessage } from '@/utils/helper/common';
import { handleErrorMessage } from '@/i18n';

export default function DashboardProjectWiki() {
  const [wikiCurrent, setWikiCurrent] = useState<any>(null);
  const [isModalOpenAddWiki, setIsModalOpenAddWiki] = useState(false);
  const [isEditWiki, setIsEditWiki] = useState(false);

  const [formEdit] = Form.useForm();
  const queryClient = useQueryClient();
  const params = useParams();
  const projectId = Number(params.projectId);

  const addWikiProjectMutation = useMutation(addWikiProject);
  const updateWikiProjectMutation = useMutation({
    mutationFn: (data: { payload: IAddWikiProject; wkiId: number }) => updateWikiProject(data.wkiId, data.payload),
  });

  const { data: wikiProjectQuery, isLoading: isLoadingWiki } = useQuery({
    queryKey: [queryKeys.wikiProjectList, projectId],
    queryFn: () => getListWikiProject({ pageSize: 1000 }),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (wikiProjectQuery?.data?.[0] && !wikiCurrent) {
      setWikiCurrent(wikiProjectQuery?.data?.[0]);
    } else {
      if (!wikiCurrent) {
        setWikiCurrent(undefined);
      }
      if (wikiCurrent) {
        // setWikiCurrent(wikiProjectQuery?.data?.find((item: any) => item.id === wikiCurrent.id));
      }
    }
  }, [wikiProjectQuery?.data]);

  useEffect(() => {
    formEdit.setFieldsValue({
      subject: wikiCurrent?.subject,
      content: wikiCurrent?.content,
    });
  }, [wikiCurrent]);

  const handleAddWikiProject = (payload: IAddWikiProject) => {
    addWikiProjectMutation.mutate(payload, {
      onSuccess: () => {
        handleSuccessMessage('Add wiki success!');
        queryClient.invalidateQueries([queryKeys.wikiProjectList]);
        setIsModalOpenAddWiki(false);
      },
      onError: (error) => {
        handleErrorMessage(error);
      },
    });
  };

  const handleUpdateWikiProject = (payload: IAddWikiProject) => {
    updateWikiProjectMutation.mutate(
      { payload, wkiId: wikiCurrent.id },
      {
        onSuccess: () => {
          handleSuccessMessage('update wiki success!');
          queryClient.invalidateQueries([queryKeys.wikiProjectList]);
          setWikiCurrent({ ...wikiCurrent, ...payload });
          setIsEditWiki(false);
        },
        onError: (error) => {
          handleErrorMessage(error);
        },
      },
    );
  };

  return (
    <div className={styles.dashboardProjectWiki}>
      <h3 style={{ marginTop: '0px' }}>Wiki</h3>
      <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
        <button
          type="submit"
          className="btn btn-green"
          style={{ height: '40px', fontWeight: '600', borderRadius: '0px' }}
          onClick={() => setIsModalOpenAddWiki(true)}
        >
          Add Wiki
        </button>
      </div>
      {!isLoadingWiki && wikiCurrent === undefined ? (
        <h3 style={{ color: 'red' }}>The current project does not have a wiki, please add a wiki to your project!</h3>
      ) : (
        <Row className={styles.dashboardProjectWikiMain}>
          <Col span={18} className={styles.dashboardProjectWikiLeft}>
            {isEditWiki ? (
              <>
                <h3 style={{ borderBottom: '1px solid #4caf93', paddingBottom: '10px' }}>{wikiCurrent?.subject}</h3>
                <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', marginBottom: '15px' }}>
                  <button
                    type="submit"
                    className="btn btn-green"
                    style={{ height: '40px', fontWeight: '600', borderRadius: '0px' }}
                    onClick={() => setIsEditWiki(false)}
                  >
                    Back
                  </button>
                </div>
                <Form
                  name="formAddIssue"
                  onFinish={handleUpdateWikiProject}
                  autoComplete="off"
                  labelCol={{ span: 12 }}
                  wrapperCol={{ span: 24 }}
                  layout="horizontal"
                  className={styles.formItem}
                  form={formEdit}
                >
                  <p>
                    <span style={{ color: 'red' }}>*</span> Subject
                  </p>
                  <Form.Item name="subject" rules={[{ required: true, message: Message.ERROR_REQUIRE_SUBJECT }]}>
                    <Input />
                  </Form.Item>

                  <p>
                    <span style={{ color: 'red' }}>*</span> Content
                  </p>
                  <Form.Item
                    style={{ backgroundColor: '#ffffff' }}
                    name="content"
                    rules={[{ required: true, message: Message.ERROR_REQUIRE_CONTENT }]}
                  >
                    <ReactQuill
                      value={wikiCurrent?.content}
                      theme={'snow'}
                      style={{ border: 'solid 1px #999', borderRadius: '4px' }}
                    />
                  </Form.Item>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="submit"
                      className="btn btn-green"
                      style={{ height: '40px', fontWeight: '600', borderRadius: '0px' }}
                      disabled={updateWikiProjectMutation.isLoading}
                    >
                      Save
                    </button>
                  </div>
                </Form>
              </>
            ) : (
              <>
                {isLoadingWiki ? (
                  <Spin></Spin>
                ) : (
                  <h3 style={{ borderBottom: '1px solid #4caf93', paddingBottom: '10px' }}>{wikiCurrent?.subject}</h3>
                )}

                <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', marginBottom: '15px' }}>
                  <button
                    type="submit"
                    className="btn btn-green"
                    style={{ height: '40px', fontWeight: '600', borderRadius: '0px' }}
                    onClick={() => setIsEditWiki(true)}
                  >
                    Edit
                  </button>
                </div>
                <div
                  style={{
                    border: '1px solid #4caf93',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    marginBottom: '15px',
                  }}
                >
                  {isLoadingWiki ? (
                    <Spin></Spin>
                  ) : (
                    <ReactQuill value={wikiCurrent?.content} readOnly={true} theme={'bubble'} />
                  )}
                </div>
                {isLoadingWiki ? (
                  <Spin />
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                    <Avatar src={wikiCurrent?.created?.avatar} />
                    <span style={{ marginLeft: '10px' }}>
                      {`Created by ${wikiCurrent?.created?.name} on ${convertUTCToGMTPlus7(wikiCurrent?.createdAt)}`}
                    </span>
                  </div>
                )}
              </>
            )}
          </Col>
          <Col span={6} className={styles.dashboardProjectWikiRight}>
            <div
              style={{
                margin: '50px 0px 30px 30px',
                padding: '20px',
                border: '1px solid #4caf93',
                backgroundColor: '#ffffff',
              }}
            >
              {isLoadingWiki ? (
                <Spin></Spin>
              ) : (
                <ul style={{ listStyle: 'none', paddingLeft: '0', margin: '0px' }}>
                  {wikiProjectQuery?.data?.map((item: any) => (
                    <li
                      onClick={() => {
                        setWikiCurrent(item);
                      }}
                      className={classNames(wikiCurrent?.id === item.id ? styles.itemWikiActive : '')}
                    >
                      <p style={{ color: '#4caf93' }}>{item.subject}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Col>
        </Row>
      )}

      <Modal
        width={1300}
        title="Add Wiki"
        open={isModalOpenAddWiki}
        footer={null}
        onCancel={() => setIsModalOpenAddWiki(false)}
      >
        <Form
          name="formAddIssue"
          onFinish={handleAddWikiProject}
          autoComplete="off"
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 24 }}
          layout="horizontal"
          className={styles.formItem}
        >
          <p>
            <span style={{ color: 'red' }}>*</span> Subject
          </p>
          <Form.Item name="subject" rules={[{ required: true, message: Message.ERROR_REQUIRE_SUBJECT }]}>
            <Input />
          </Form.Item>

          <p>
            <span style={{ color: 'red' }}>*</span> Content
          </p>
          <Form.Item name="content" rules={[{ required: true, message: Message.ERROR_REQUIRE_CONTENT }]}>
            <ReactQuill theme="snow" style={{ border: 'solid 1px #999', borderRadius: '4px' }} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="submit"
              className="btn btn-green"
              style={{ height: '40px', fontWeight: '600', borderRadius: '0px' }}
              disabled={addWikiProjectMutation.isLoading}
            >
              Add
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
