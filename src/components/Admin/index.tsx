import useProfileClient from '@/utils/hooks/useProfileClient';
import styles from './styles.module.scss';
import { UserRole } from '@/connstant/enum/common';
import { history } from '@/App';
import { Outlet } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import routePaths from '@/connstant/routePaths';

export default function Admin() {
  const { profile } = useProfileClient(true);

  console.log(profile);
  useEffect(() => {
    if (profile && profile?.role !== UserRole.ADMIN) {
      history.push(routePaths.forbiddenResource);
    }
  }, [profile]);

  return (
    <div className={styles.adminPage}>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </div>
  );
}
