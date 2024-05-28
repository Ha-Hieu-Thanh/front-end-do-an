import { Suspense } from 'react';
import NavSetting from '../NavSetting';
import styles from './styles.module.scss';
import { Outlet, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function DashboardProjectSetting() {
  const { projectId } = useParams();
  if (projectId) {
    Cookies.set('projectId', projectId);
  }

  return (
    <div className={styles.dashboardProjectSetting}>
      <NavSetting />
      <div className={styles.mainDashboardProjectSetting}>
        <Suspense fallback={null}>
          <div className={styles.settingContent}>
            <Outlet />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
