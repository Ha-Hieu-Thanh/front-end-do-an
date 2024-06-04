import {
  BarChartOutlined,
  FileAddOutlined,
  FileTextOutlined,
  FileWordOutlined,
  HomeOutlined,
  IssuesCloseOutlined,
  SettingOutlined,
  AreaChartOutlined,
} from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import styles from './styles.module.scss';
import { Link, useLocation } from 'react-router-dom';
import useGetProjectDetail, { IDetailProject } from '@/utils/hooks/useGetDetailProject';
import { UserProjectRole, UserRole } from '@/connstant/enum/common';
import useProfileClient from '@/utils/hooks/useProfileClient';
type MenuItem = Required<MenuProps>['items'][number];
function getItem(
  key: React.Key,
  icon?: React.ReactNode,
  label?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  const items = { key, icon, children, type };
  if (label) {
    Object.assign(items, { label });
  }
  return items as MenuItem;
}

export default function DashboardMainNav({ projectId }: { projectId: number }) {
  const location = useLocation();
  const { profile } = useProfileClient(true);
  const { data } = useGetProjectDetail();
  const project = data?.data as IDetailProject;
  const linkTo: any = {
    home: `/project/${projectId}`,
    addIssue: `/project/${projectId}/add-issue`,
    issue: `/project/${projectId}/issue`,
    board: `/project/${projectId}/board`,
    wiki: `/project/${projectId}/wiki`,
    projectSettings: `/project/${projectId}/setting`,
  };
  const pathname = location.pathname;

  const selectedKeys = Object.keys(linkTo).reduce((acc, cur) => {
    const isHome = linkTo.home === linkTo[cur];
    if (isHome) {
      acc.push(pathname);
    }
    if (!isHome && pathname.includes(linkTo[cur])) {
      acc.push(linkTo[cur]);
    }
    return acc;
  }, [] as any);

  const items: MenuItem[] = [
    getItem(linkTo.home, <HomeOutlined />, <Link to={linkTo.home}>Home</Link>),
    getItem(linkTo.addIssue, <FileAddOutlined />, <Link to={linkTo.addIssue}>Add Issue</Link>),
    getItem(linkTo.issue, <IssuesCloseOutlined />, <Link to={linkTo.issue}>Issues</Link>),
    getItem(linkTo.board, <BarChartOutlined />, <Link to={linkTo.board}>Board</Link>),
    getItem(linkTo.wiki, <FileWordOutlined />, <Link to={linkTo.wiki}>Wiki</Link>),
  ];

  if (
    [UserRole.ADMIN].includes(profile?.role) ||
    [UserProjectRole.PM, UserProjectRole.SUB_PM].includes(project?.userProject?.role)
  ) {
    items.push(
      getItem(linkTo.projectSettings, <SettingOutlined />, <Link to={linkTo.projectSettings}>Project Settings</Link>),
    );
  }
  return (
    <div className={styles.main}>
      <Menu selectedKeys={selectedKeys} mode="inline" items={items} className={styles.mainNav} />
    </div>
  );
}
