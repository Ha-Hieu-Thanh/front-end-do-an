import { history } from '@/App';
import { addMemberProject, membersProject, projectIssueCategory, updateStaff } from '@/api/client/project';
import icons from '@/assets/icons';
import {
  IFilterStaff,
  Message,
  PAGE_INDEX,
  PAGE_SIZE,
  TextALign,
  UserProjectRole,
  UserProjectRoleText,
  UserProjectStatus,
  UserProjectStatusText,
} from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import { handleErrorMessage } from '@/i18n';
import { getSerialNumber, handleSuccessMessage } from '@/utils/helper/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Col, Form, Input, Modal, Row, Select, Switch, Table, Typography } from 'antd';
import { useState, useEffect } from 'react';
import CustomPagination from '../CustomPagination';
import styles from './styles.module.scss';
import { useParams } from 'react-router-dom';

export const initialFilter: IFilterStaff = {
  pageSize: PAGE_SIZE,
  pageIndex: PAGE_INDEX,
  keyword: '',
};

export default function ProjectSettingMembers() {
  const addMemberProjectMutation = useMutation(addMemberProject);
  const [filterStaff, setFilterStaff] = useState<IFilterStaff>(initialFilter);
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  const [openUpdateStaff, setOpenUpdateStaff] = useState<{ isOpen: boolean; record: any }>({
    isOpen: false,
    record: null,
  });
  const handleChangePage = (pageIndex: number, pageSize: number) => {
    setFilterStaff((prevFilterStaff) => {
      return {
        ...prevFilterStaff,
        pageIndex,
        pageSize,
      };
    });
  };

  const membersProjectQuery = useQuery({
    queryKey: [queryKeys.membersProject, filterStaff, projectId],
    queryFn: () => membersProject(filterStaff),
    keepPreviousData: true,
  });

  const projectIssueCategories = useQuery({
    queryKey: [queryKeys.projectIssueCategory, initialFilter, projectId],
    queryFn: () => projectIssueCategory(initialFilter),
    keepPreviousData: true,
  });

  const [form] = Form.useForm();
  const updateStaffMutation = useMutation(updateStaff);
  const handleSubmitUpdateStaff = (data: any) => {
    const payload = { ...data, userId: openUpdateStaff.record?.userId };
    if (data.status) {
      Object.assign(payload, { status: UserProjectStatus.IN_ACTIVE });
    }
    updateStaffMutation.mutate(payload, {
      onSuccess: () => {
        handleSuccessMessage('Update staff success!');
        queryClient.invalidateQueries([queryKeys.membersProject]);
        setOpenUpdateStaff({ isOpen: false, record: null });
      },
      onError: (error) => {
        handleErrorMessage(error);
      },
    });
  };

  const optionRoles = [
    { value: UserProjectRole.STAFF, label: 'Staff' },
    { value: UserProjectRole.SUB_PM, label: 'Sub PM' },
    { value: UserProjectRole.PM, label: 'PM' },
  ];

  const columns = [
    {
      width: 60,
      title: 'Stt',
      key: 'stt',
      render: (_text: any, _record: any, index: number) => {
        const stt = [filterStaff?.pageIndex, filterStaff?.pageSize].every((item) => item)
          ? getSerialNumber(index, filterStaff.pageIndex, filterStaff.pageSize, true)
          : '';
        return <Typography.Paragraph key={stt}>{stt}</Typography.Paragraph>;
      },
    },
    {
      title: 'Nickname',
      dataIndex: ['user', 'name'],
      key: 'nickname',
    },
    {
      title: 'Email',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (_text: UserProjectRole, _record: any, index: number) => {
        return UserProjectRoleText[_text];
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_text: UserProjectStatus, _record: any, index: number) => {
        return UserProjectStatusText[_text];
      },
    },
    {
      title: 'Joined on',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 175,
      render: (_: any, record: any) => {
        return (
          <>
            {record?.status === UserProjectStatus.ACTIVE ? (
              <Row
                // onClick={() => history.push(`/staff/edit-staff/${record.id}`)}
                align="middle"
                gutter={11}
                className="cursor-pointer"
              >
                <Col
                  onClick={() => {
                    setOpenUpdateStaff({ isOpen: true, record });
                    form.setFieldsValue({
                      role: record?.role,
                      categoryIds: record.user.categoryIds,
                    });
                    setRoleUpdateSelecting(record?.role);
                  }}
                >
                  <img style={{ cursor: 'pointer' }} src={icons.EditOutlined}></img>
                </Col>
              </Row>
            ) : (
              <Row align="middle" gutter={11} style={{ cursor: 'not-allowed' }}>
                <Col>
                  <img src={icons.EditOutlined}></img>
                </Col>
              </Row>
            )}
          </>
        );
      },
    },
  ];
  const handleSubmitAddMember = (payload: any) => {
    addMemberProjectMutation.mutate(
      {
        email: payload.email,
        role: Number(payload.role),
        categoryIds: payload.role === UserProjectRole.SUB_PM ? payload.categoryIds : undefined,
      },
      {
        onSuccess: () => {
          handleSuccessMessage('Add member success!');
          queryClient.invalidateQueries(['members-project']);
        },
        onError: (error) => {
          handleErrorMessage(error);
        },
      },
    );
  };

  const [roleSelecting, setRoleSelecting] = useState(UserProjectRole.STAFF);
  const [roleUpdateSelecting, setRoleUpdateSelecting] = useState(UserProjectRole.STAFF);
  const handleOnChangeRole = (value: UserProjectRole) => {
    setRoleSelecting(value);
  };
  const handleOnChangeRoleUpdate = (value: UserProjectRole) => {
    setRoleUpdateSelecting(value);
  };
  return (
    <div className={styles.dashboardProjectSettingMembers}>
      <h4>Edit Members</h4>
      <p>Add Member</p>
      <div className={styles.addMember}>
        <Form
          name="formAddMember"
          onFinish={handleSubmitAddMember}
          autoComplete="off"
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 24 }}
          layout="vertical"
          className={styles.formItem}
          initialValues={{ role: UserProjectRole.STAFF }}
        >
          <Form.Item
            name="email"
            labelAlign="right"
            className={styles.formItemLabel}
            rules={[
              { required: true, message: Message.ERROR_REQUIRE_EMAIL },
              { type: 'email', message: Message.ERROR_FORMAT_EMAIL },
            ]}
          >
            <Input placeholder="Email add project" />
          </Form.Item>

          <Form.Item name="role">
            <Select style={{ width: '10%' }} options={optionRoles} onChange={handleOnChangeRole}></Select>
          </Form.Item>

          <Form.Item name="categoryIds">
            <Select
              mode="multiple"
              placeholder="Please select categories (Only for SUB PM)"
              filterOption={(input, option) => {
                return (option?.children as any).toLowerCase()?.includes(input.toLowerCase());
              }}
              disabled={roleSelecting !== UserProjectRole.SUB_PM}
            >
              {projectIssueCategories?.data?.data?.map((category: any) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: '5px' }} className={styles.submitAddMember}>
            <div style={{ marginTop: '0px', textAlign: 'center', height: '40px' }}>
              <button type="submit" className="btn btn-green" style={{ height: '40px' }}>
                Add selection to project
              </button>
            </div>
          </Form.Item>
        </Form>
      </div>

      <p>Project Members</p>
      <div className={styles.projectMembers}>
        <Table
          dataSource={membersProjectQuery?.data?.data}
          pagination={false}
          columns={columns}
          style={{ marginBottom: '30px' }}
        ></Table>
        <div>
          <CustomPagination
            totalItems={membersProjectQuery.data?.totalItems || 0}
            handleChangePage={handleChangePage}
            current={filterStaff.pageIndex}
            pageSize={filterStaff.pageSize}
            align={TextALign.Right}
          />
        </div>
      </div>

      <Modal
        title="Update staff"
        open={openUpdateStaff.isOpen}
        onCancel={() => setOpenUpdateStaff({ isOpen: false, record: null })}
        footer={null}
      >
        <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', marginBottom: '20px' }}>
          <Avatar src={openUpdateStaff.record?.user?.avatar400x400 ?? icons.HedLayer}></Avatar>
          <span style={{ marginLeft: '10px', fontWeight: '500' }}>{openUpdateStaff.record?.user?.name}</span>
          <span style={{ marginLeft: '10px' }}>( {openUpdateStaff.record?.user?.email} )</span>
        </div>
        {openUpdateStaff.record && (
          <Form
            name="formUpdateStaff"
            onFinish={(data) => {
              handleSubmitUpdateStaff(data);
            }}
            initialValues={{ remember: false }}
            autoComplete="off"
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 24 }}
            layout="horizontal"
            style={{ justifyContent: 'start' }}
            form={form}
          >
            <Form.Item label={'Block user'} name="status" labelAlign="left" style={{ textAlign: 'start' }}>
              <Switch />
            </Form.Item>

            <Form.Item label={'Role'} name="role" labelAlign="left" style={{ textAlign: 'start' }}>
              <Select options={optionRoles} style={{ width: 100 }} onChange={handleOnChangeRoleUpdate}></Select>
            </Form.Item>

            <Form.Item label={'Category'} name="categoryIds" labelAlign="left" style={{ textAlign: 'start' }}>
              <Select
                mode="multiple"
                placeholder="Please select categories (Only for SUB PM)"
                filterOption={(input, option) => {
                  return (option?.children as any).toLowerCase()?.includes(input.toLowerCase());
                }}
                disabled={roleUpdateSelecting !== UserProjectRole.SUB_PM}
              >
                {projectIssueCategories?.data?.data?.map((category: any) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: '5px', textAlign: 'center' }} className={styles.submitLogin}>
              <div style={{ marginTop: '18.5px' }}>
                <button type="submit" className="btn btn-green" disabled={updateStaffMutation.isLoading}>
                  Update
                </button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
