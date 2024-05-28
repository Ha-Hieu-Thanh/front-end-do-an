import { Form, Input } from 'antd';
import styles from './styles.module.scss';
import { Message } from '@/connstant/enum/common';
import useGetProjectDetail, { IDetailProject } from '@/utils/hooks/useGetDetailProject';
import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMyProjects } from '@/api/client/project';
import queryKeys from '@/connstant/queryKeys';
import { handleErrorMessage } from '@/i18n';

export default function ProjectSettingGeneral() {
  const { data } = useGetProjectDetail();
  const project = data?.data as IDetailProject;
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const updateProjectMutation = useMutation(updateMyProjects);

  const handleSubmitUpdateProject = (payload: any) => {
    updateProjectMutation.mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.projectDetail]);
      },
      onError: (error) => {
        handleErrorMessage(error);
      },
    });
  };

  useEffect(() => {
    form.setFieldsValue({
      name: project?.name,
      key: project?.key,
    });
  }, [project]);

  return (
    <div className={styles.dashboardProjectSettingGeneral}>
      <h4>General</h4>
      <Form
        name="formCreateProject"
        onFinish={handleSubmitUpdateProject}
        form={form}
        autoComplete="off"
        labelCol={{ span: 12 }}
        wrapperCol={{ span: 24 }}
        layout="vertical"
        className={styles.formItem}
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
            <Input />
          </Form.Item>
          <span>
            The project key is a unique identifier for a project. A short, concise key is recommended. (e.g. Project
            name Backlog has project key BLG_2) Uppercase letters (A-Z), numbers (0-9) and underscore (_) can be used.
          </span>
        </div>
        <div>
          <Form.Item style={{ marginBottom: '5px' }} className={styles.submitUpdateProject}>
            <div style={{ marginTop: '18.5px', textAlign: 'center' }}>
              <button type="submit" className="btn btn-green" disabled={updateProjectMutation.isLoading}>
                Save
              </button>
            </div>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
