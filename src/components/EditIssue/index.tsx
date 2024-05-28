import { IPayloadUpdateIssue, issueDetail, updateIssue } from '@/api/client/project';
import { Message, Priority } from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import { handleErrorMessage } from '@/i18n';
import { convertUTCToGMTPlus7, handleSuccessMessage } from '@/utils/helper/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Col, DatePicker, Form, Input, InputNumber, Row, Select } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './styles.module.scss';

export default function EditIssue({
  issueId,
  showModalDetailIssue,
  handleCancelEditIssue,
  projectIssueStateQuery,
  projectIssueCategoriesQuery,
  projectVersionQuery,
  membersProjectQuery,
  projectIssueTypeQuery,
  issueDetail,
}: {
  issueId: number;
  showModalDetailIssue: () => void;
  handleCancelEditIssue: () => void;
  projectIssueStateQuery: any;
  projectIssueCategoriesQuery: any;
  projectVersionQuery: any;
  membersProjectQuery: any;
  projectIssueTypeQuery: any;
  issueDetail: { data: issueDetail };
}) {
  const [size, setSize] = useState<SizeType>('middle');
  const updateIssueMutation = useMutation({
    mutationFn: (variables: { issueId: number; payload: IPayloadUpdateIssue }) =>
      updateIssue(variables.issueId, variables.payload),
  });
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      typeId: issueDetail?.data?.typeId,
      subject: issueDetail?.data?.subject,
      description: issueDetail?.data?.description,
      stateId: issueDetail?.data?.stateId,
      assigneeId: issueDetail?.data?.assigneeId,
      priority: issueDetail?.data?.priority,
      categoryId: issueDetail?.data?.categoryId,
      versionId: issueDetail?.data?.versionId || null,
      startDate: issueDetail?.data?.startDate ? dayjs(issueDetail?.data?.startDate, 'YYYY-MM-DD') : null,
      dueDate: issueDetail?.data?.dueDate ? dayjs(issueDetail?.data?.dueDate, 'YYYY-MM-DD') : null,
      estimatedHours: issueDetail?.data?.estimatedHours,
      actualHours: issueDetail?.data?.actualHours,
    });
  }, [issueDetail]);

  const handleSubmitUpdateIssue = (payload: IPayloadUpdateIssue) => {
    if (payload.startDate) {
      payload.startDate = convertUTCToGMTPlus7(payload.startDate.toISOString()).slice(0, 10);
    }
    if (payload.dueDate) {
      payload.dueDate = convertUTCToGMTPlus7(payload.dueDate.toISOString()).slice(0, 10);
    }
    if (payload.actualHours) {
      payload.actualHours = Number(payload.actualHours);
    }
    if (payload.estimatedHours) {
      payload.estimatedHours = Number(payload.estimatedHours);
    }
    if (payload.versionId) {
      payload.versionId = Number(payload.versionId);
    }
    const queryUpdate: string[] = [`${queryKeys.projectIssueList}-${issueDetail?.data?.stateId}`];
    if (issueDetail?.data?.stateId !== payload.stateId) {
      queryUpdate.push(`${queryKeys.projectIssueList}-${payload.stateId}`);
    }
    updateIssueMutation.mutate(
      { issueId, payload },
      {
        onSuccess: () => {
          handleSuccessMessage('Update issue success!');
          if (queryUpdate.length) {
            queryUpdate.map((item) => queryClient.invalidateQueries([item]));
            queryClient.invalidateQueries([queryKeys.issueList]);
            queryClient.invalidateQueries([queryKeys.issueDetail]);
          }
          handleCancelEditIssue();
        },
        onError: (error) => {
          handleErrorMessage(error);
        },
      },
    );
  };

  return (
    <div className={styles.issueDetail}>
      <Form
        name="formAddIssue"
        onFinish={handleSubmitUpdateIssue}
        autoComplete="off"
        labelCol={{ span: 12 }}
        wrapperCol={{ span: 24 }}
        layout="horizontal"
        className={styles.formItem}
        form={form}
      >
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <Form.Item style={{ marginBottom: '5px' }}>
            <div style={{ marginTop: '0px', textAlign: 'end', height: '40px' }}>
              <button
                className={classNames('btn', styles.btnBack)}
                onClick={(e: any) => {
                  handleCancelEditIssue();
                  showModalDetailIssue();
                }}
                type="button"
              >
                Back
              </button>
            </div>
          </Form.Item>
          <Form.Item style={{ marginBottom: '5px', marginLeft: '15px' }}>
            <div style={{ marginTop: '0px', textAlign: 'end', height: '40px' }}>
              <button className={classNames('btn', styles.btnSave)} type="submit">
                Save
              </button>
            </div>
          </Form.Item>
        </div>

        <Form.Item name="typeId">
          <Select
            style={{ width: '10%' }}
            filterOption={(input, option: any) => (option?.label ?? '').includes(input)}
            options={projectIssueTypeQuery?.data?.map((item: any) => ({ value: item.id, label: item.name }))}
            size={size}
          ></Select>
        </Form.Item>

        <Form.Item name="subject" rules={[{ required: true, message: Message.ERROR_REQUIRE_SUBJECT }]}>
          <Input />
        </Form.Item>

        <div className={styles.editIssueMain}>
          <Form.Item name="description">
            <ReactQuill theme="snow" style={{ border: 'solid 1px #999', borderRadius: '4px' }} />
          </Form.Item>

          <Row gutter={[40, 16]}>
            <Col span={12}>
              <Form.Item
                className={styles.itemInput}
                style={{ width: '50%' }}
                name="stateId"
                label="State"
                rules={[{ required: true, message: Message.ERROR_REQUIRE_STATE }]}
              >
                <Select
                  style={{ width: '100%' }}
                  className={styles.itemInputxxx}
                  optionFilterProp="children"
                  filterOption={(input, option: any) => {
                    console.log(option);
                    // return (option?.label.props.children[1].props.children ?? '')
                    //   .toLowerCase()
                    //   .includes(input.toLowerCase());
                    return true;
                  }}
                  options={(projectIssueStateQuery?.data || []).map((item: any) => ({
                    value: item.id,
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center', width: '70%' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '13px',
                            height: '13px',
                            borderRadius: '50%',
                            backgroundColor: item.backgroundColor,
                            marginRight: '5px',
                          }}
                        ></span>{' '}
                        {item.name}
                      </div>
                    ),
                  }))}
                ></Select>
              </Form.Item>
            </Col>

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
                  options={(membersProjectQuery?.data || []).map((item: any) => ({
                    value: item.userId,
                    label: item.user.email || item.user.email,
                  }))}
                ></Select>
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
                  options={(projectIssueCategoriesQuery?.data || []).map((item: any) => ({
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
                  options={(projectVersionQuery?.data || []).map((item: any) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                ></Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item className={styles.itemInput} style={{ width: '50%' }} name="startDate" label="Start Date">
                <DatePicker
                  format="YYYY-MM-DD"
                  placeholder="YYYY-MM-DD"
                  type-control="date"
                  style={{ width: '100%' }}
                  allowClear={true}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item className={styles.itemInput} style={{ width: '50%' }} name="dueDate" label="Due Date">
                <DatePicker
                  format="YYYY-MM-DD"
                  placeholder="YYYY-MM-DD"
                  type-control="date"
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
              <Form.Item className={styles.itemInput} style={{ width: '50%' }} name="actualHours" label="Actual Hours">
                <InputNumber min={0} max={24} />
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
          </Row>
        </div>

        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <Form.Item style={{ marginBottom: '5px' }}>
            <div style={{ marginTop: '0px', textAlign: 'end', height: '40px' }}>
              <button
                className={classNames('btn', styles.btnBack)}
                onClick={(e: any) => {
                  handleCancelEditIssue();
                  showModalDetailIssue();
                }}
                type="button"
              >
                Back
              </button>
            </div>
          </Form.Item>
          <Form.Item style={{ marginBottom: '5px', marginLeft: '15px' }}>
            <div style={{ marginTop: '0px', textAlign: 'end', height: '40px' }}>
              <button className={classNames('btn', styles.btnSave)} type="submit">
                Save
              </button>
            </div>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
