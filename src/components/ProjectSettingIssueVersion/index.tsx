import { addIssueVersion, projectIssueCategories, projectIssueVersion, updateIssueVersion } from '@/api/client/project';
import { DragDropType, Message } from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import { handleErrorMessage } from '@/i18n';
import { convertUTCToGMTPlus7, handleSuccessMessage } from '@/utils/helper/common';
import { RollbackOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatePicker, Form, Input, Modal } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { lazy, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './styles.module.scss';
const DragAndDropList = lazy(() => import('../DragDrop'));

export default function ProjectSettingIssueVersion() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const updateIssueVersionMutation = useMutation(updateIssueVersion);
  const addIssueVersionMutation = useMutation(addIssueVersion);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = (payload: any) => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { data: projectVersionQuery } = useQuery({
    queryKey: [queryKeys.projectVersion, projectId],
    queryFn: () => projectIssueVersion({ pageSize: 100 }),
    keepPreviousData: true,
  });

  const handleAddIssueVersion = (payload: any) => {
    if (payload.startDate) {
      payload.startDate = convertUTCToGMTPlus7(payload.startDate.toISOString()).slice(0, 10);
    }
    if (payload.endDate) {
      payload.endDate = convertUTCToGMTPlus7(payload.endDate.toISOString()).slice(0, 10);
    }
    addIssueVersionMutation.mutate(payload, {
      onSuccess: () => {
        handleSuccessMessage('Add issue Version success!');
        queryClient.invalidateQueries([queryKeys.projectVersion]);
        handleCancel();
      },
      onError: (error) => {
        handleErrorMessage(error);
      },
    });
  };
  return (
    <div className={styles.dashboardProjectSettingIssueVersion}>
      <h4>Edit Issue Version</h4>
      <div style={{ marginTop: '0px', textAlign: 'start', height: '30px' }}>
        <button type="submit" className="btn btn-green" style={{ height: '30px' }} onClick={showModal}>
          Add Issue Version
        </button>
      </div>
      <DragAndDropList
        items={projectVersionQuery?.data || []}
        updateMutation={updateIssueVersionMutation}
        type={DragDropType.VERSION}
      />
      <Modal
        title="Add Issue version"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={1000}
      >
        <span style={{ color: '#00836b', cursor: 'pointer' }} onClick={handleCancel}>
          <RollbackOutlined /> Back
        </span>
        <Form name="formAddIssueVersion" onFinish={handleAddIssueVersion} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: Message.ERROR_REQUIRE_ISSUE_NAME },
              () => ({
                validator(data, value: string) {
                  if (!value) {
                    return Promise.resolve();
                  }
                  if (value.length > 255) {
                    return Promise.reject(new Error(Message.ERROR_FORMAT_ISSUE_NAME));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input width={100} />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea showCount maxLength={1000} style={{ height: 200, marginBottom: 24 }} placeholder="can resize" />
          </Form.Item>

          <Form.Item
            className={styles.itemInput}
            style={{ width: '50%' }}
            name="startDate"
            label="Start Date"
            rules={[{ required: true }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
              type-control="date"
              style={{ width: '100%' }}
              allowClear={true}
            />
          </Form.Item>

          <Form.Item
            className={styles.itemInput}
            style={{ width: '50%' }}
            name="endDate"
            label="End Date"
            rules={[
              ({ getFieldValue }) => ({
                validator(data, value: any) {
                  const startDate = getFieldValue('startDate');
                  if (startDate && startDate.toISOString().slice(0, 10) > value.toISOString().slice(0, 10)) {
                    return Promise.reject(Message.ERROR_START_DATE_MORE_THAN_DUE_DATE);
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
              type-control="date"
              style={{ width: '100%' }}
              allowClear={true}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '5px' }} className={styles.submitLogin}>
            <div style={{ marginTop: '18.5px', textAlign: 'center', height: '35px' }}>
              <button type="submit" className="btn btn-green" style={{ height: '35px' }}>
                Submit
              </button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
