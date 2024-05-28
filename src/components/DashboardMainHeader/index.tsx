import { useParams } from 'react-router-dom';
import styles from './styles.module.scss';
import useGetProjectDetail, { IDetailProject } from '@/utils/hooks/useGetDetailProject';
import { Spin } from 'antd';

export default function DashboardMainHeader() {
  const { data } = useGetProjectDetail();
  const project = data?.data as IDetailProject;
  return (
    <div className={styles.dashboardMainHeader}>
      <div className={styles.dashboardMainLeft}>
        {project ? (
          <>
            <p>{project?.name}</p>
            <p>({project?.key})</p>
          </>
        ) : (
          <Spin />
        )}
      </div>
      <div className={styles.dashboardMainLeft}>{/* <p>DashboardMainHeaderRight</p> */}</div>
    </div>
  );
}
