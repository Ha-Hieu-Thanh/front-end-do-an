import {
  addIssueState,
  addIssueType,
  projectIssueState,
  projectIssueTypes,
  updateIssueState,
  updateIssueType,
} from '@/api/client/project';
import { DragDropType, Message } from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import { RollbackOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColorPicker, ColorPickerProps, Form, Input, Modal } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { lazy, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './styles.module.scss';
import { handleSuccessMessage } from '@/utils/helper/common';
import { handleErrorMessage } from '@/i18n';
const DragAndDropList = lazy(() => import('../DragDrop'));

export default function ProjectSettingIssueStates() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const updateIssueStateMutation = useMutation(updateIssueState);
  const addIssueStateMutation = useMutation(addIssueState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<ColorPickerProps['value']>('#1677ff');
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

  const { data: projectIssueStatesQuery } = useQuery({
    queryKey: [queryKeys.projectIssueState, projectId],
    queryFn: () => projectIssueState({ pageSize: 100 }),
    keepPreviousData: true,
  });

  const handleAddIssueState = (payload: any) => {
    const data = Object.assign(payload, { backgroundColor });
    addIssueStateMutation.mutate(data, {
      onSuccess: () => {
        handleSuccessMessage('Add issue state success!');
        queryClient.invalidateQueries([queryKeys.projectIssueState]);
        handleCancel();
      },
      onError: (error) => {
        handleErrorMessage(error);
      },
    });
  };
  return (
    <div className={styles.dashboardProjectSettingIssueStates}>
      <h4>Edit Issue States</h4>
      <div style={{ marginTop: '0px', textAlign: 'start', height: '30px' }}>
        <button type="submit" className="btn btn-green" style={{ height: '30px' }} onClick={showModal}>
          Add Issue State
        </button>
      </div>
      <DragAndDropList
        items={projectIssueStatesQuery?.data || []}
        updateMutation={updateIssueStateMutation}
        type={DragDropType.STATE}
      />
      <Modal
        title="Add Issue Type"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={1000}
      >
        <span style={{ color: '#00836b', cursor: 'pointer' }} onClick={handleCancel}>
          <RollbackOutlined /> Back
        </span>
        <Form name="formAddIssueType" onFinish={handleAddIssueState} layout="vertical">
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

          <Form.Item name="backgroundColor" label="Background color">
            <ColorPicker
              allowClear
              value={backgroundColor}
              onChange={(color) => {
                setBackgroundColor(color.toHexString());
              }}
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
