import { addIssueCategory, addIssueType, projectIssueCategories, updateIssueCategories } from '@/api/client/project';
import { DragDropType, Message } from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import { handleErrorMessage } from '@/i18n';
import { handleSuccessMessage } from '@/utils/helper/common';
import { RollbackOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Modal } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { lazy, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './styles.module.scss';
const DragAndDropList = lazy(() => import('../DragDrop'));

export default function ProjectSettingIssueCategory() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const updateIssueTypesMutation = useMutation(updateIssueCategories);
  const addIssueCategoryMutation = useMutation(addIssueCategory);
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

  const { data: projectIssueCategoriesQuery } = useQuery({
    queryKey: [queryKeys.projectIssueCategories, projectId],
    queryFn: () => projectIssueCategories({ pageSize: 100 }),
    keepPreviousData: true,
  });

  const handleAddIssueCategory = (payload: any) => {
    addIssueCategoryMutation.mutate(payload, {
      onSuccess: () => {
        handleSuccessMessage('Add issue category success!');
        queryClient.invalidateQueries([queryKeys.projectIssueCategories]);
        handleCancel();
      },
      onError: (error) => {
        handleErrorMessage(error);
      },
    });
  };
  return (
    <div className={styles.dashboardProjectSettingIssueCategories}>
      <h4>Edit Issue Categories</h4>
      <div style={{ marginTop: '0px', textAlign: 'start', height: '30px' }}>
        <button type="submit" className="btn btn-green" style={{ height: '30px' }} onClick={showModal}>
          Add Issue category
        </button>
      </div>
      <DragAndDropList
        items={projectIssueCategoriesQuery?.data || []}
        updateMutation={updateIssueTypesMutation}
        type={DragDropType.ISSUE_CATEGORY}
      />
      <Modal
        title="Add Issue Category"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={1000}
      >
        <span style={{ color: '#00836b', cursor: 'pointer' }} onClick={handleCancel}>
          <RollbackOutlined /> Back
        </span>
        <Form name="formAddIssueCategory" onFinish={handleAddIssueCategory} layout="vertical">
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
