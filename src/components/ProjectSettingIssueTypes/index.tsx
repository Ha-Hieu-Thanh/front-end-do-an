import { addIssueType, projectIssueTypes, updateIssueType } from '@/api/client/project';
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

export default function ProjectSettingIssueTypes() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const updateIssueTypesMutation = useMutation(updateIssueType);
  const addIssueTypeMutation = useMutation(addIssueType);
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

  const { data: projectIssueTypesQuery } = useQuery({
    queryKey: [queryKeys.projectIssueTypes, projectId],
    queryFn: () => projectIssueTypes({ pageSize: 100 }),
    keepPreviousData: true,
  });

  const handleAddIssueType = (payload: any) => {
    const data = Object.assign(payload, { backgroundColor });
    addIssueTypeMutation.mutate(data, {
      onSuccess: () => {
        handleSuccessMessage('Add issue type success!');
        queryClient.invalidateQueries([queryKeys.projectIssueTypes]);
        handleCancel();
      },
      onError: (error) => {
        handleErrorMessage(error);
      },
    });
  };
  return (
    <div className={styles.dashboardProjectSettingIssueTypes}>
      <h4>Edit Issue Types</h4>
      <div style={{ marginTop: '0px', textAlign: 'start', height: '30px' }}>
        <button type="submit" className="btn btn-green" style={{ height: '30px' }} onClick={showModal}>
          Add Issue Type
        </button>
      </div>
      <DragAndDropList
        items={projectIssueTypesQuery?.data || []}
        updateMutation={updateIssueTypesMutation}
        type={DragDropType.ISSUE_TYPE}
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
        <Form name="formAddIssueType" onFinish={handleAddIssueType} layout="vertical">
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
