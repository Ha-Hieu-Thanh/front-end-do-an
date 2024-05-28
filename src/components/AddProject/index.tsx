import { Message } from '@/connstant/enum/common';
import { Form, Input, Modal } from 'antd';
import { memo, useState } from 'react';
import styles from './styles.module.scss';
import { ReloadOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateKey } from '@/api/client/project';
import { handleErrorMessage } from '@/i18n';
import queryKeys from '@/connstant/queryKeys';
function AddProject(params: any) {
  const [form] = Form.useForm();
  const [key, setKey] = useState<string>('');
  const generateKeyMutation = useMutation({
    mutationFn: (variables: { name?: string }) => generateKey(variables),
  });

  const queryClient = useQueryClient();

  const handleSubmitCreateProject = (payload: any) => {
    params.handleOk(payload);
    queryClient.invalidateQueries([queryKeys.projectList]);
  };

  const generateKeyNew = () => {
    generateKeyMutation.mutate(
      { name: form.getFieldValue('name') },
      {
        onSuccess: (data) => {
          form.setFieldValue('key', data?.data);
          setKey(data?.data);
        },
        onError: (error) => {
          handleErrorMessage(error);
        },
      },
    );
  };
  return (
    <>
      {/* <Modal title="Add Project" open={params.isModalOpen} onOk={params.handleOk} onCancel={params.handleCancel}> */}
      <Modal title="Add Project" open={params.isModalOpen} footer={null} onCancel={params.handleCancel}>
        <Form
          name="formCreateProject"
          onFinish={handleSubmitCreateProject}
          // initialValues={}
          autoComplete="off"
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 24 }}
          layout="vertical"
          className={styles.formItem}
          form={form}
        >
          <div id="projectName">
            <Form.Item
              label="Project Name"
              name="name"
              labelAlign="right"
              className={styles.formItemLabel}
              rules={[
                { required: true, message: Message.ERROR_REQUIRE_PROJECT_NAME },
                () => ({
                  validator(data, value: string) {
                    if (!value) {
                      return Promise.resolve();
                    }
                    if (value.length > 255) {
                      return Promise.reject(new Error(Message.ERROR_FORMAT_PROJECT_NAME));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input />
            </Form.Item>
          </div>
          <div id="projectKey">
            <Form.Item
              label="Project Key"
              name="key"
              labelAlign="right"
              className={styles.formItemLabel}
              rules={[
                { required: true, message: Message.ERROR_REQUIRE_PROJECT_KEY },
                () => ({
                  validator(data, value: string) {
                    if (!value) {
                      return Promise.resolve();
                    }
                    if (value.length > 255) {
                      return Promise.reject(new Error(Message.ERROR_FORMAT_PROJECT_KEY));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Input value={key} onChange={(e) => setKey(e.target.value)} />
                  <ReloadOutlined
                    onClick={generateKeyNew}
                    style={{ cursor: 'pointer', padding: '0px 10px', fontSize: '20px' }}
                    title="Auto generate key project"
                  />
                </div>
                <span>
                  The project key is a unique identifier for a project. A short, concise key is recommended. (e.g.
                  Project name Backlog has project key BLG_2) Uppercase letters (A-Z), numbers (0-9) and underscore (_)
                  can be used.
                </span>
              </div>
            </Form.Item>
          </div>
          <div>
            <Form.Item style={{ marginBottom: '5px' }} className={styles.submitLogin}>
              <div style={{ marginTop: '18.5px', textAlign: 'center' }}>
                <button type="submit" className="btn btn-green">
                  Submit
                </button>
              </div>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
}
export default memo(AddProject);
