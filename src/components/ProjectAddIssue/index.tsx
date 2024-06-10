import { history } from '@/App';
import { addProjectIssue, membersProject, projectIssueCategory, projectVersion } from '@/api/client/project';
import { IFilterStaff, Message, PAGE_INDEX, Priority, UserProjectStatus } from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import { handleErrorMessage } from '@/i18n';
import { convertUTCToGMTPlus7, handleSuccessMessage } from '@/utils/helper/common';
import useGetProjectDetail, { IDetailProject } from '@/utils/hooks/useGetDetailProject';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Col, DatePicker, Form, Input, InputNumber, Row, Select, SelectProps } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { first } from 'lodash';
import { memo, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useParams } from 'react-router-dom';
import styles from './styles.module.scss';

export const initialFilter: IFilterStaff = {
  pageSize: 100,
  pageIndex: PAGE_INDEX,
};
export const initialStaff: IFilterStaff = {
  pageSize: 100,
  pageIndex: PAGE_INDEX,
  status: [UserProjectStatus.ACTIVE],
};

function DashboardProjectAddIssue({
  projectId,
  handleOkAddIssue,
}: {
  projectId?: number;
  handleOkAddIssue?: () => void;
}) {
  const [size, setSize] = useState<SizeType>('middle');
  const [stateDefault, setStateDefault] = useState<string | undefined>();
  const [optionType, setOptionType] = useState<SelectProps['options']>();
  const [filterStaff, setFilterStaff] = useState<IFilterStaff>(initialStaff);
  const [filter, setFilter] = useState<IFilterStaff>(initialFilter);
  const params = useParams();
  if (!projectId && params.projectId) {
    projectId = Number(params.projectId);
  }
  const { mutate: addProjectIssueMutation, isLoading: loadingAddProjectIssue } = useMutation(addProjectIssue);
  const queryClient = useQueryClient();

  const { data } = useGetProjectDetail();
  const membersProjectQuery = useQuery({
    queryKey: [queryKeys.membersProject, filterStaff, projectId],
    queryFn: () => membersProject(filterStaff),
    keepPreviousData: true,
  });
  const projectIssueCategories = useQuery({
    queryKey: [queryKeys.projectIssueCategory, filter, projectId],
    queryFn: () => projectIssueCategory(filter),
    keepPreviousData: true,
  });
  const projectVersions = useQuery({
    queryKey: [queryKeys.projectVersion, filter, projectId],
    queryFn: () => projectVersion(filter),
    keepPreviousData: true,
  });
  const project = data?.data as IDetailProject;
  const projectIssueTypes = project?.projectIssueTypes;
  const projectIssueStates = project?.projectIssueStates;

  const [form] = Form.useForm();
  useEffect(() => {
    if (first(projectIssueTypes) && first(projectIssueStates)) {
      form.setFieldsValue({
        typeId: first(projectIssueTypes)?.id,
        stateId: first(projectIssueStates)?.id,
      });
      setStateDefault(first(projectIssueStates)?.name);
    }

    setOptionType((projectIssueTypes || []).map((item: any) => ({ value: item.id, label: item.name })));
  }, [projectIssueTypes, projectIssueStates]);

  const handleSubmitAddIssue = (payload: {
    typeId: number;
    subject: string;
    description: string;
    assigneeId: number;
    priority: number;
    startDate: any;
    dueDate: any;
    estimatedHours: number;
    actualHours: number;
    categoryId: number;
    versionId: number;
    stateId: number;
  }) => {
    if (payload.startDate) {
      payload.startDate = convertUTCToGMTPlus7(payload.startDate.toISOString()).slice(0, 16);
    }
    if (payload.dueDate) {
      payload.dueDate = convertUTCToGMTPlus7(payload.dueDate.toISOString()).slice(0, 16);
    }
    const { stateId, ...data } = payload;
    addProjectIssueMutation(data, {
      onSuccess: () => {
        handleSuccessMessage('Add issue success!');
        queryClient.invalidateQueries([
          queryKeys.projectDetail,
          queryKeys.projectIssueCategory,
          queryKeys.projectIssueHistory,
        ]);
        if (handleOkAddIssue) {
          queryClient.invalidateQueries([`${queryKeys.projectIssueList}-${stateId}`]);
          handleOkAddIssue();
        } else {
          history.push(`/project/${projectId}/board`);
        }
      },
      onError: (error) => {
        handleErrorMessage(error);
      },
    });
  };
  return (
    <div className={styles.dashboardProjectAddIssue}>
      <h3>Add Issue</h3>
      <div>
        <Form
          name="formAddIssue"
          onFinish={handleSubmitAddIssue}
          autoComplete="off"
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 24 }}
          layout="horizontal"
          className={styles.formItem}
          form={form}
          initialValues={{ priority: Priority.NORMAL }}
        >
          <Form.Item style={{ marginBottom: '5px' }} className={styles.submitAddIssue}>
            <div style={{ marginTop: '0px', textAlign: 'end', height: '40px' }}>
              <button
                disabled={loadingAddProjectIssue}
                type="submit"
                className="btn btn-green"
                style={{ height: '40px', borderRadius: '0px' }}
              >
                Add
              </button>
            </div>
          </Form.Item>
          <Form.Item name="typeId">
            <Select style={{ width: '10%' }} options={optionType} size={size}></Select>
          </Form.Item>

          <Form.Item name="subject" rules={[{ required: true, message: Message.ERROR_REQUIRE_SUBJECT }]}>
            <Input />
          </Form.Item>

          <div className={styles.addIssueMain}>
            <Form.Item name="description">
              <ReactQuill theme="snow" style={{ border: 'solid 1px #999', borderRadius: '4px' }} />
            </Form.Item>

            <Row gutter={[40, 16]}>
              <Col span={12}>
                <Form.Item
                  className={styles.itemInput}
                  style={{ width: '50%' }}
                  name="assigneeId"
                  label="Assignee"
                  rules={[{ required: true, message: Message.ERROR_REQUIRE_ASSIGNEE }]}
                >
                  <Select
                    style={{ width: '100%' }}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option: any) => (option?.label ?? '').includes(input)}
                    options={(membersProjectQuery?.data?.data || []).map((item: any) => ({
                      value: item.userId,
                      label: item.user.email || item.user.email,
                    }))}
                  ></Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item className={styles.itemInput} style={{ width: '50%' }} name="priority" label="Priority">
                  <Select
                    size={size}
                    style={{ width: '100%' }}
                    options={[
                      { value: Priority.HIGH, label: 'High' },
                      { value: Priority.NORMAL, label: 'Normal' },
                      { value: Priority.LOW, label: 'Low' },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item className={styles.itemInput} style={{ width: '50%' }} name="categoryId" label="Category">
                  <Select
                    style={{ width: '100%' }}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option: any) => (option?.label ?? '').includes(input)}
                    options={(projectIssueCategories?.data?.data || []).map((item: any) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  ></Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item className={styles.itemInput} style={{ width: '50%' }} name="versionId" label="Version">
                  <Select
                    style={{ width: '100%' }}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option: any) => (option?.label ?? '').includes(input)}
                    options={(projectVersions?.data?.data || []).map((item: any) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  ></Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item className={styles.itemInput} style={{ width: '50%' }} name="startDate" label="Start Date">
                  <DatePicker
                    format="YYYY-MM-DD HH:mm"
                    placeholder="YYYY-MM-DD HH:mm"
                    type-control="date"
                    showTime
                    style={{ width: '100%' }}
                    allowClear={true}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  className={styles.itemInput}
                  style={{ width: '50%' }}
                  name="dueDate"
                  label="Due Date"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(data, value: any) {
                        const startDate = getFieldValue('startDate');
                        if (startDate && startDate.toISOString().slice(0, 16) > value.toISOString().slice(0, 16)) {
                          return Promise.reject(Message.ERROR_START_DATE_MORE_THAN_DUE_DATE);
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    format="YYYY-MM-DD HH:mm"
                    placeholder="YYYY-MM-DD HH:mm"
                    type-control="date"
                    showTime
                    style={{ width: '100%' }}
                    allowClear={true}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  className={styles.itemInput}
                  style={{ width: '50%' }}
                  name="estimatedHours"
                  label="Estimated Hours"
                >
                  <InputNumber min={0} max={24} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  className={styles.itemInput}
                  style={{ width: '50%' }}
                  name="actualHours"
                  label="Actual Hours"
                >
                  <InputNumber min={0} max={24} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item className={styles.itemInput} style={{ width: '50%' }} name="stateId" label="State">
                  <p>{stateDefault}</p>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Form.Item style={{ marginBottom: '0px' }} className={styles.submitAddMember}>
            <div style={{ marginTop: '10px', textAlign: 'end', height: '40px' }}>
              <button
                disabled={loadingAddProjectIssue}
                type="submit"
                className="btn btn-green"
                style={{ height: '40px', borderRadius: '0px' }}
              >
                Add
              </button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
export default memo(DashboardProjectAddIssue);
