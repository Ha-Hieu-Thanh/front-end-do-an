import DashboardMainNav from '@/components/DashboardMainNav';
import { Suspense, lazy } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import styles from './styles.module.scss';
import Cookies from 'js-cookie';
const DashboardMainHeader = lazy(() => import('@/components/DashboardMainHeader'));

export default function Main() {
  const { projectId } = useParams();
  if (projectId) {
    Cookies.set('projectId', projectId);
  }

  return (
    <div className={styles.main}>
      <DashboardMainNav projectId={Number(projectId)} />
      <div className={styles.mainWrapper}>
        <DashboardMainHeader />

        <Suspense fallback={null}>
          <div className={styles.pageContent}>
            <Outlet />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
