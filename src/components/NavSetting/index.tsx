import { SettingOutlined } from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import { Link, useLocation, useParams } from 'react-router-dom';
import styles from './styles.module.scss';
type MenuItem = Required<MenuProps>['items'][number];
function getItem(
  key: React.Key,
  label?: React.ReactNode,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  const items = { key, icon, children, type };
  if (label) {
    Object.assign(items, { label });
  }
  return items as MenuItem;
}

export default function NavSetting() {
  const location = useLocation();
  const { projectId } = useParams();
  const linkTo = {
    general: `/project/${projectId}/setting`,
    members: `/project/${projectId}/setting/members`,
    issueTypes: `/project/${projectId}/setting/issue-types`,
    categories: `/project/${projectId}/setting/categories`,
    versions: `/project/${projectId}/setting/versions`,
    states: `/project/${projectId}/setting/states`,
  };

  const items: MenuItem[] = [
    getItem(
      '',
      <div>
        <SettingOutlined />
      </div>,
    ),
    getItem(linkTo.general, <Link to={linkTo.general}>General</Link>),
    getItem(linkTo.members, <Link to={linkTo.members}>Members</Link>),
    getItem(linkTo.issueTypes, <Link to={linkTo.issueTypes}>Issue Types</Link>),
    getItem(linkTo.categories, <Link to={linkTo.categories}>Categories</Link>),
    getItem(linkTo.versions, <Link to={linkTo.versions}>Versions</Link>),
    getItem(linkTo.states, <Link to={linkTo.states}>States</Link>),
  ];
  return (
    <div className={styles.main}>
      <Menu selectedKeys={[location.pathname]} mode="inline" items={items} className={styles.mainNav} />
    </div>
  );
}
