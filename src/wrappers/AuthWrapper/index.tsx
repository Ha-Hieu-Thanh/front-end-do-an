import Cookies from 'js-cookie';
import { Suspense, lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from './contexts';
const DashboardHeader = lazy(() => import('@components/DashboardHeader'));

export default function PageWrapper() {
  const isAuthenticated = !!Cookies.get('token');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const valueContext = {};

  return (
    <AppProvider value={valueContext}>
      <DashboardHeader />

      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </AppProvider>
  );
}
