import { useQuery } from '@tanstack/react-query';
import styles from './styles.module.scss';
import queryKeys from '@/connstant/queryKeys';
import { getMyProjects, projectIssueList } from '@/api/client/project';
import { Avatar, Input, Select, Table, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { MonitorOutlined } from '@ant-design/icons';
import styled from '@xstyled/styled-components';
import icons from '@/assets/icons';
import { Priority, TextPriority } from '@/connstant/enum/common';
import moment from 'moment';
import { debounce } from 'lodash';
import Cookies from 'js-cookie';

const initialFilterIssue = {
  pageSize: 10,
  pageIndex: 1,
  isGetAll: true,
};

const ItemType = styled.spanBox`
  color: white;
  background-color: ${(props: any) => props.backgroundColor};
  border-radius: 20px;
  padding: 1px 10px;
`;
const ItemKey = styled.aBox`
  color: #00836b;
`;
const ItemState = styled.spanBox`
  color: white;
  background-color: ${(props: any) => props.backgroundColor};
  border-radius: 20px;
  padding: 1px 10px;
`;

export default function IssueManagement() {
  Cookies.remove('projectId');

  const [projectIds, setProjectIds] = useState<number[] | undefined>(undefined);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState<boolean>(false);
  const [filterIssues, setFilterIssues] = useState(initialFilterIssue);
  const [keyword, setKeyword] = useState<string>('');

  const setSearchKeyword = useRef(
    debounce((value: string) => {
      setKeyword(value);
      setFilterIssues((prev) => ({ ...prev, pageIndex: 1 }));
    }, 500),
  );
  const handleKeyWord = ({ target }: { target: { value: string } }) => {
    setSearchKeyword.current(target.value);
  };
  const { data: dataProjects } = useQuery([queryKeys.projectList], () => getMyProjects(), {
    keepPreviousData: true,
  });
  const handleAdvancedSearch = () => {
    setIsAdvancedSearch(!isAdvancedSearch);
  };
  const { data: issuesProject } = useQuery({
    queryKey: [queryKeys.issueList, projectIds, keyword, filterIssues, isAdvancedSearch],
    queryFn: () =>
      projectIssueList({
        keyword,
        projectIds,
        isAdvancedSearch,
        ...filterIssues,
      }),
    keepPreviousData: true,
  });

  const columns = [
    {
      title: 'Issue Type',
      dataIndex: ['projectIssueType'],
      key: 'issueType',
      render: (data: any, record: any) => {
        return <ItemType backgroundColor={data?.backgroundColor}>{data?.name}</ItemType>;
      },
    },
    {
      title: 'Project',
      dataIndex: ['project'],
      key: 'issueProject',
      render: (data: any, record: any) => {
        return (
          <>
            <ItemKey>{data?.key}</ItemKey>
            <div>{data?.name}</div>
          </>
        );
      },
    },
    {
      title: 'Key',
      key: 'issueKey',
      render: (data: any, record: any) => {
        return (
          <ItemKey>
            {data.project.key}-{data.id}
          </ItemKey>
        );
      },
    },
    {
      title: 'Subject',
      dataIndex: ['subject'],
      key: 'issueSubject',
      width: 300,
      render: (data: any, record: any) => {
        return <p style={{ overflowWrap: 'break-word', maxWidth: '350px' }}>{data}</p>;
      },
    },
    {
      title: 'CreatedBy',
      dataIndex: ['created'],
      key: 'issueCreatedBy',
      render: (data: any, record: any) => {
        return (
          <div>
            <Avatar src={data?.avatar400x400 ?? icons.HedLayer}></Avatar>
            <span style={{ marginLeft: '10px' }}>{data?.name || data?.email}</span>
          </div>
        );
      },
    },
    {
      title: 'Assignee',
      dataIndex: ['assignee'],
      key: 'issueAssignee',
      render: (data: any, record: any) => {
        return (
          <div>
            <Avatar src={data?.avatar400x400 ?? icons.HedLayer}></Avatar>
            <span style={{ marginLeft: '10px' }}>{data?.name || data?.email}</span>
          </div>
        );
      },
    },
    {
      title: 'State',
      dataIndex: ['projectIssueState'],
      key: 'issueState',
      render: (data: any, record: any) => {
        return <ItemState backgroundColor={data?.backgroundColor}>{data?.name}</ItemState>;
      },
    },
    {
      title: 'Category',
      dataIndex: ['projectIssueCategory'],
      key: 'issueCategory',
      render: (data: any, record: any) => {
        return <p>{data?.name}</p>;
      },
    },
    {
      title: 'Priority',
      dataIndex: ['priority'],
      key: 'issuePriority',
      render: (data: Priority, record: any) => {
        return <p>{TextPriority[data]}</p>;
      },
    },
    {
      title: 'Version',
      dataIndex: ['projectVersion'],
      key: 'issueVersion',
      render: (data: any, record: any) => {
        return <p>{data?.name}</p>;
      },
    },
    {
      title: 'Created',
      dataIndex: ['createdAt'],
      key: 'issueCreatedAt',
      render: (data: any, record: any) => {
        return <p>{moment(data).utcOffset(7).format('YYYY-MM-DD HH:mm')}</p>;
      },
    },
    {
      title: 'Start Date',
      dataIndex: ['startDate'],
      key: 'issueStartDate',
      render: (data: any, record: any) => {
        return <p>{data ? moment(data).utcOffset(7).format('YYYY-MM-DD HH:mm') : ''}</p>;
      },
    },
    {
      title: 'Due Date',
      dataIndex: ['dueDate'],
      key: 'issueDueDate',
      render: (data: any, record: any) => {
        return <p>{data ? moment(data).utcOffset(7).format('YYYY-MM-DD HH:mm') : ''}</p>;
      },
    },
    {
      title: 'Estimated Hours',
      dataIndex: ['estimatedHours'],
      key: 'issueEstimatedHours',
      render: (data: any, record: any) => {
        return <p>{data ? Number(data) : ''}</p>;
      },
    },
    {
      title: 'Actual Hours',
      dataIndex: ['actualHours'],
      key: 'issueActualHours',
      render: (data: any, record: any) => {
        return <p>{data ? Number(data) : ''}</p>;
      },
    },
    {
      title: 'Updated',
      dataIndex: ['updatedAt'],
      key: 'issueUpdated',
      render: (data: any, record: any) => {
        return <p>{moment(data).utcOffset(7).format('YYYY-MM-DD HH:mm')}</p>;
      },
    },
  ];

  return (
    <div className={styles.issueManagement}>
      <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', alignItems: 'center' }}>
        <label style={{ fontSize: '1.5rem', fontWeight: '500' }}>Select projects:</label>
        <Select
          mode="multiple"
          showSearch
          placeholder="Select projects"
          optionFilterProp="children"
          onChange={(value) => setProjectIds(value)}
          allowClear
          filterOption={(input, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          style={{ flexGrow: 1 }}
          options={dataProjects?.data?.map((item: any) => ({ value: item.id, label: item?.key }))}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <Input
          placeholder="Search by keyword"
          allowClear
          onChange={handleKeyWord}
          style={{ margin: '20px 0', flexGrow: 1 }}
        />
        <Tooltip title="Advanced search">
          <Avatar
            icon={<MonitorOutlined />}
            style={{
              cursor: 'pointer',
              marginLeft: '10px',
              backgroundColor: isAdvancedSearch ? '#4caf93' : 'rgba(0, 0, 0, 0.25)',
            }}
            size={33}
            onClick={handleAdvancedSearch}
          />
        </Tooltip>
      </div>
      <Table
        dataSource={issuesProject && issuesProject.data}
        columns={columns}
        pagination={
          isAdvancedSearch
            ? false
            : {
                current: filterIssues.pageIndex,
                pageSize: filterIssues.pageSize,
                total: issuesProject?.totalItems,
                onChange: (pageIndex, pageSize) => setFilterIssues({ ...filterIssues, pageIndex, pageSize }),
              }
        }
        scroll={{ x: 3000 }}
      />
    </div>
  );
}
