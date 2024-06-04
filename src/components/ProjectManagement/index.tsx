import {
  IParamsGetListProjectInSystem,
  IResponseGetListProjectInSystemData,
  getListProjectInSystem,
} from '@/api/admin/admin';
import queryKeys from '@/connstant/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { Input } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { history } from '@/App';
import styles from './styles.module.scss';

export const initFilterProjects: IParamsGetListProjectInSystem = {
  pageIndex: 1,
  pageSize: 5,
};

export default function ProjectManagement() {
  const [filterProject, setFilterProject] = useState<IParamsGetListProjectInSystem>(initFilterProjects);

  const { data: projectList } = useQuery({
    queryKey: [queryKeys.listProjectInSystem, { ...filterProject }],
    queryFn: () => getListProjectInSystem(filterProject),
    keepPreviousData: true,
    enabled: true,
  });

  const columns: ColumnsType<IResponseGetListProjectInSystemData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Member Count',
      dataIndex: 'memberCount',
      key: 'memberCount',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
  ];

  return (
    <div style={{ marginTop: '30px' }} className={styles.projectManagement}>
      <Input.Search
        placeholder="Search project"
        onSearch={(value) => {
          setFilterProject({
            ...filterProject,
            keyword: value,
          });
        }}
        style={{ marginBottom: '16px' }}
      />
      <Table
        dataSource={projectList?.data}
        columns={columns}
        style={{ cursor: 'pointer' }}
        pagination={{
          current: filterProject.pageIndex,
          pageSize: filterProject.pageSize,
          total: projectList?.totalItems,
          onChange: (pageIndex, pageSize) => {
            setFilterProject({
              ...filterProject,
              pageIndex,
              pageSize,
            });
          },
        }}
        onRow={(record) => {
          return {
            onClick: () => {
              console.log(record);
              history.push(`/project/${record.id}`);
            },
          };
        }}
      />
    </div>
  );
}
