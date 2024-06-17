import ForbiddenResource from '@/components/ForbiddenResource';
import ProjectSettingIssueStates from '@/components/ProjectSettingIssueStates';
import routePaths from '@/connstant/routePaths';
import NotFound from '@/pages/404';
import VerifyRegister from '@/pages/ConfirmRegister';
import AuthWrapper from '@wrappers/AuthWrapper';
import Main from '@wrappers/AuthWrapper/main';
import { lazy } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
// import Admin from '@/components/Admin';
const Admin = lazy(() => import('@/components/Admin'));
const ProjectSettingMembers = lazy(() => import('@/components/ProjectSettingMembers'));
const ProjectSettingGeneral = lazy(() => import('@/components/ProjectSettingGeneral'));
const Login = lazy(() => import('@pages/Login'));
const DashboardBody = lazy(() => import('@/components/DashboardBody'));
const Project = lazy(() => import('@/components/Project'));
const DashboardProjectAddIssue = lazy(() => import('@/components/ProjectAddIssue'));
const DashboardProjectIssues = lazy(() => import('@/components/ProjectIssues'));
const DashboardProjectBoard = lazy(() => import('@/components/ProjectBoard'));
const DashboardProjectGanttChart = lazy(() => import('@/components/ProjectGanttChart'));
const DashboardProjectWiki = lazy(() => import('@/components/ProjectWiki'));
const DashboardProjectFiles = lazy(() => import('@/components/ProjectFiles'));
const DashboardProjectSetting = lazy(() => import('@/components/ProjectSetting'));
const RegisterForm = lazy(() => import('@pages/Register'));
const ProjectSettingIssueTypes = lazy(() => import('@/components/ProjectSettingIssueTypes'));
const ProjectSettingIssueCategory = lazy(() => import('@/components/ProjectSettingIssueCategory'));
const ProjectSettingIssueVersion = lazy(() => import('@/components/ProjectSettingIssueVersion'));
const Profile = lazy(() => import('@/components/Profile'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ConfirmForgotPasswordForm = lazy(() => import('@/pages/ConfirmForgotPassword'));
const UserManagement = lazy(() => import('@/components/UserManagement'));
const ProjectManagement = lazy(() => import('@/components/ProjectManagement'));
const IssueManagement = lazy(() => import('@/components/IssueManagement'));
const Welcome = lazy(() => import('@/components/Welcome'));

export default function AppWrapper(): any {
  return (
    <div className="root-wrapper">
      <Routes>
        <Route path={routePaths.login} element={<Login />} />
        <Route path={routePaths.register} element={<RegisterForm />} />
        <Route path={routePaths.verifyRegister} element={<VerifyRegister />} />
        <Route path={routePaths.forgotPassword} element={<ForgotPassword />} />
        <Route path={routePaths.confirmForgotPassword} element={<ConfirmForgotPasswordForm />} />
        <Route path={routePaths.forbiddenResource} element={<ForbiddenResource />} />
        <Route path="/" element={<AuthWrapper />}>
          <Route path="/" element={<Welcome />}></Route>
          <Route path="/dashboard" element={<DashboardBody />}></Route>
          <Route path="/profile" element={<Profile />}></Route>
          <Route path="/admin" element={<Admin />}>
            <Route path="/admin" element={<NotFound />} />
            <Route path="/admin/user-management" element={<UserManagement />} />
            <Route path="/admin/project-management" element={<ProjectManagement />} />
            <Route path="/admin/issue-management" element={<IssueManagement />} />
          </Route>
          <Route path="/project/:projectId" element={<Main />}>
            <Route path="" element={<Project />}></Route>
            <Route path="/project/:projectId/add-issue" element={<DashboardProjectAddIssue />}></Route>
            <Route path="/project/:projectId/issue" element={<DashboardProjectIssues />}></Route>
            <Route path="/project/:projectId/issue/:issueId" element={<DashboardProjectIssues />}></Route>
            <Route path="/project/:projectId/board" element={<DashboardProjectBoard />}></Route>
            <Route path="/project/:projectId/gantt-chart" element={<DashboardProjectGanttChart />}></Route>
            <Route path="/project/:projectId/wiki" element={<DashboardProjectWiki />}></Route>
            <Route path="/project/:projectId/files" element={<DashboardProjectFiles />}></Route>
            <Route path="/project/:projectId/setting" element={<DashboardProjectSetting />}>
              <Route path="/project/:projectId/setting" element={<ProjectSettingGeneral />}></Route>
              <Route path="/project/:projectId/setting/members" element={<ProjectSettingMembers />}></Route>
              <Route path="/project/:projectId/setting/issue-types" element={<ProjectSettingIssueTypes />}></Route>
              <Route path="/project/:projectId/setting/categories" element={<ProjectSettingIssueCategory />}></Route>
              <Route path="/project/:projectId/setting/versions" element={<ProjectSettingIssueVersion />}></Route>
              <Route path="/project/:projectId/setting/states" element={<ProjectSettingIssueStates />}></Route>
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </div>
  );
}
