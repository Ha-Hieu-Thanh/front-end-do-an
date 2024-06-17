import {
  IParamsGetListProjectInSystem,
  IResponseGetListProjectInSystemData,
  getListProjectInSystem,
} from '@/api/admin/admin';
import queryKeys from '@/connstant/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { Input } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useRef, useState } from 'react';
import { history } from '@/App';
import styles from './styles.module.scss';
import { debounce } from 'lodash';
import Cookies from 'js-cookie';
import moment from 'moment';

export const initFilterProjects: IParamsGetListProjectInSystem = {
  pageIndex: 1,
  pageSize: 5,
};

export default function ProjectManagement() {
  Cookies.remove('projectId');
  const [filterProject, setFilterProject] = useState<IParamsGetListProjectInSystem>(initFilterProjects);
  const [keyword, setKeyword] = useState<string>('');

  const setSearchKeyword = useRef(
    debounce((value: string) => {
      setKeyword(value);
      setFilterProject((prev) => ({ ...prev, pageIndex: 1 }));
    }, 500),
  );
  const handleKeyWord = ({ target }: { target: { value: string } }) => {
    setSearchKeyword.current(target.value);
  };
  const { data: projectList } = useQuery({
    queryKey: [queryKeys.listProjectInSystem, { keyword, ...filterProject }],
    queryFn: () => getListProjectInSystem({ keyword, ...filterProject }),
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
      title: 'Issue Count',
      dataIndex: 'issueCount',
      key: 'issueCount',
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
  ];

  return (
    <div style={{ marginTop: '30px' }} className={styles.projectManagement}>
      <Input placeholder="Search project" onChange={handleKeyWord} style={{ marginBottom: '16px' }} />
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
