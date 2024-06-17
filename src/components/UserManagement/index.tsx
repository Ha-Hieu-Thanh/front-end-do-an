import { Table, Button, Input } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
  IParamsGetListProjectInSystem,
  IPayloadUpdateUserInSystem,
  IResponseGetListUserInSystem,
  IResponseGetListUserInSystemData,
  getListUserInSystem,
  updateUserInSystem,
} from '@/api/admin/admin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import queryKeys from '@/connstant/queryKeys';
import { UserRole, UserStatus } from '@/connstant/enum/common';
import icons from '@/assets/icons';
import { debounce } from 'lodash';
import Cookies from 'js-cookie';
import moment from 'moment';

export const initFilterUser: IParamsGetListProjectInSystem = {
  pageIndex: 1,
  pageSize: 5,
};

export default function UserManagement() {
  Cookies.remove('projectId');

  const [filterUser, setFilterUser] = useState<IParamsGetListProjectInSystem>(initFilterUser);
  const [keyword, setKeyword] = useState<string>('');
  const setSearchKeyword = useRef(
    debounce((value: string) => {
      setKeyword(value);
      setFilterUser((prev) => ({ ...prev, pageIndex: 1 }));
    }, 500),
  );
  const handleKeyWord = ({ target }: { target: { value: string } }) => {
    setSearchKeyword.current(target.value);
  };

  const queryClient = useQueryClient();

  const { data: userList } = useQuery({
    queryKey: [queryKeys.listUserInSystem, { keyword, ...filterUser }],
    queryFn: () => getListUserInSystem({ keyword, ...filterUser }),
    keepPreviousData: true,
    enabled: true,
  });

  const updateUserInSystemMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: IPayloadUpdateUserInSystem }) =>
      updateUserInSystem(userId, payload),
  });

  const columns: ColumnsType<IResponseGetListUserInSystemData> = [
    {
      title: 'Avatar',
      dataIndex: 'avatar50x50',
      key: 'avatar50x50',
      render: (avatar: string) => (
        <img src={avatar || icons.HedLayer} alt="avt" style={{ width: '50px', height: '50px' }} />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      // birth day
      title: 'Birthday',
      dataIndex: 'birthday',
      key: 'birthday',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: number) => (role === UserRole.ADMIN ? 'Admin' : 'Client'),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (data: any, record: any) => {
        return <p>{moment(data).utcOffset(7).format('YYYY-MM-DD HH:mm')}</p>;
      },
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (data: any, record: any) => {
        return <p>{moment(data).utcOffset(7).format('YYYY-MM-DD HH:mm')}</p>;
      },
    },
    {
      title: 'Action',
      dataIndex: 'status',
      key: 'status',
      render: (status: UserStatus, record: IResponseGetListUserInSystemData) =>
        status === UserStatus.ACTIVE ? (
          <Button onClick={() => handleToggleStatus(record.id!)} type="primary" danger>
            Block
          </Button>
        ) : (
          <Button onClick={() => handleToggleStatus(record.id!)} type="primary">
            Active
          </Button>
        ),
    },
  ];

  const handleToggleStatus = (userId: number) => {
    const user = userList?.data?.find((u) => u.id === userId);
    console.log(user);
    if (!user) return;
    const status = user.status === UserStatus.ACTIVE ? UserStatus.BLOCKED : UserStatus.ACTIVE;
    updateUserInSystemMutation.mutate(
      { userId, payload: { status } },
      {
        onSuccess: (data) => queryClient.invalidateQueries([queryKeys.listUserInSystem]),
        onError: (err) => {
          console.log(err);
        },
      },
    );
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <Input allowClear placeholder="Search user" onChange={handleKeyWord} style={{ marginBottom: '16px' }} />
      <Table
        dataSource={userList && userList.data}
        columns={columns}
        pagination={{
          current: filterUser.pageIndex,
          pageSize: filterUser.pageSize,
          total: userList?.totalItems,
          onChange: (pageIndex, pageSize) => setFilterUser({ ...filterUser, pageIndex, pageSize }),
        }}
        // make it scrollable horizontally
        scroll={{ x: 1500 }}
      />
    </div>
  );
}
