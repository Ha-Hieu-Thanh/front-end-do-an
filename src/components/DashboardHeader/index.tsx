import { history } from '@/App';
import { IClientChangePassword, clientChangePassword } from '@/api/client/auth';
import {
  IPayloadReadNotification,
  confirmJoinProject,
  createMyProjects,
  getCountNotificationUnread,
  getMyProjects,
  projectIssueList,
  readNotification,
} from '@/api/client/project';
import icons from '@/assets/icons';
import { LabelDefault, MenuKey, Message, UserProjectStatus, UserRole } from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import { handleErrorMessage } from '@/i18n';
import { handleSuccessMessage, logout } from '@/utils/helper/common';
import { validate } from '@/utils/helper/validate';
import useProfileClient from '@/utils/hooks/useProfileClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Checkbox, Drawer, Dropdown, Form, Input, Menu, MenuProps, Modal, Select, message } from 'antd';
import debounce from 'lodash/debounce';
import { startTransition, useCallback, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AddProject from '../AddProject';
import styles from './styles.module.scss';
import ListNotification from '../ListNotification';
import socket from '@/utils/socket';
import SearchProjects from '../SearchProjects';
import SearchIssues from '../SearchIssues';
export default function DashboardHeader() {
  const containerRef = useRef<any>();
  const { profile } = useProfileClient(true);
  const [keywordProjects, setKeywordProjects] = useState('');
  const [keywordIssues, setKeywordIssues] = useState('');
  const [pageIndexProjects, setPageIndexProjects] = useState(1);
  const [isModalOpenAddProject, setIsModalOpenAddProject] = useState(false);
  const [isModalOpenAddIssue, setIsModalOpenAddIssue] = useState(false);
  const [isRead, setIsRead] = useState<boolean | undefined>(undefined);

  const [isModalOpenSearchProject, setIsModalOpenSearchProject] = useState(false);
  const handleCancelSearchProject = () => {
    setIsModalOpenSearchProject(false);
    inputRef.current.value = '';
    setKeywordProjects('');
  };

  const [isModalOpenSearchIssue, setIsModalOpenSearchIssue] = useState(false);
  const handleCancelSearchIssue = () => {
    setIsModalOpenSearchIssue(false);
    inputRefIssue.current.value = '';
    setKeywordIssues('');
  };

  const changePasswordMutation = useMutation({
    mutationFn: (params: IClientChangePassword) => clientChangePassword(params),
  });

  const handleSubmitChangePassword = (payload: IClientChangePassword) => {
    changePasswordMutation.mutate(payload, {
      onSuccess: (data) => {
        handleSuccessMessage('Change password successfully!');
        setOpenChangePassword(false);
      },
      onError: (error) => {
        handleErrorMessage(error);
      },
    });
  };

  const handleReadNotification = useMutation({
    mutationFn: (params: IPayloadReadNotification) => readNotification(params),
  });

  const handleReadAllNoti = () => {
    handleReadNotification.mutate(
      {
        isReadAll: true,
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries([queryKeys.listNotification]);
          queryClient.invalidateQueries([queryKeys.countNotiUnread]);
        },
        onError: (error) => {
          handleErrorMessage(error);
        },
      },
    );
  };

  const setSearchValue = useRef(
    debounce((value: string) => {
      setKeywordProjects(value);
      setPageIndexProjects(1);
    }, 500),
  );
  const inputRef = useRef<any>();

  const setSearchValueIssue = useRef(
    debounce((value: string) => {
      setKeywordIssues(value);
    }, 500),
  );
  const inputRefIssue = useRef<any>();

  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState<number | null>();

  const createProjectMutation = useMutation({
    mutationFn: (payload: any) => createMyProjects(payload),
  });
  const joinProjectMutation = useMutation({
    mutationFn: (payload: { status: UserProjectStatus; projectId: number }) => confirmJoinProject(payload),
  });
  const { data: dataProjects } = useQuery(
    [queryKeys.projectList, keywordProjects, pageIndexProjects],
    () => getMyProjects({ pageSize: 5, keyword: keywordProjects, pageIndex: pageIndexProjects }),
    {
      keepPreviousData: true,
    },
  );

  const { data: dataIssues } = useQuery(
    [queryKeys.issueList, keywordIssues],
    () => projectIssueList({ isAdvancedSearch: true, keyword: keywordIssues }),
    {
      keepPreviousData: true,
    },
  );

  const { data: countNotiUnread } = useQuery([queryKeys.countNotiUnread], () => getCountNotificationUnread(), {
    keepPreviousData: true,
  });

  /* ---------------------------- Model add project --------------------------- */
  const showModalAddProject = useCallback(() => {
    setIsModalOpenAddProject(true);
  }, []);
  const handleOkAddProject = useCallback((payload: any) => {
    createProjectMutation.mutate(payload, {
      onSuccess: () => {
        setIsModalOpenAddProject(false);
        queryClient.invalidateQueries([queryKeys.projectList]);
      },
      onError: (error) => {
        handleErrorMessage(error);
      },
    });
  }, []);
  const handleJoinProject = (status: UserProjectStatus, projectId: number) => {
    joinProjectMutation.mutate(
      { status, projectId },
      {
        onSuccess: () => {
          if (status === UserProjectStatus.ACTIVE) {
            handleSuccessMessage('Join project success!');
          }
          if (status === UserProjectStatus.REJECT) {
            handleSuccessMessage('Reject join project success!');
          }
          queryClient.invalidateQueries([queryKeys.projectList]);
        },
        onError: (error) => {
          handleErrorMessage(error);
          queryClient.invalidateQueries([queryKeys.projectList]);
        },
      },
    );
  };
  const handleCancelAddProject = useCallback(() => {
    setIsModalOpenAddProject(false);
  }, []);

  /* ----------------------------- Model add issue ---------------------------- */
  const showModalAddIssue = useCallback(() => {
    setIsModalOpenAddIssue(true);
  }, []);
  const handleOkAddIssue = useCallback((payload: any) => {
    // createProjectMutation.mutate(payload, {
    //   onSuccess: () => {
    //     setIsModalOpenAddIssue(false);
    //   },
    //   onError: (error) => {
    //     handleErrorMessage(error);
    //   },
    // });
  }, []);
  const handleCancelAddIssue = useCallback(() => {
    setIsModalOpenAddIssue(false);
  }, []);
  const handleChangeInputAddIssue = useCallback((value: any) => {
    setProjectId(value);
  }, []);
  const { data } = useQuery([queryKeys.projectList], () => getMyProjects({ pageSize: 1000 }), {
    keepPreviousData: true,
  });

  // Drawer help
  const [openHelp, setOpenHelp] = useState(false);

  const showDrawerHelp = () => {
    setOpenHelp(true);
  };

  const onCloseHelp = () => {
    setOpenHelp(false);
  };

  // Drawer Notification
  const [openNotification, setOpenNotification] = useState(false);

  const showDrawerNotification = () => {
    setOpenNotification(true);
  };

  const onCloseNotification = () => {
    setOpenNotification(false);
  };

  // Drawer View
  const [openView, setOpenView] = useState(false);

  const showDrawerView = () => {
    setOpenView(true);
  };

  const onCloseView = () => {
    setOpenView(false);
  };

  const [openChangePassword, setOpenChangePassword] = useState(false);

  const returnDataProjectsAddIssue = useCallback((data: any) => {
    return (
      <div>
        <p>Select a project</p>
        <Select
          style={{ width: '100%' }}
          allowClear
          showSearch
          onChange={handleChangeInputAddIssue}
          optionFilterProp="children"
          filterOption={(input, option: any) => (option?.label ?? '').includes(input)}
          options={(data?.data || []).map((item: any) => ({
            value: item.id,
            label: item.name,
          }))}
        ></Select>
      </div>
    );
  }, []);

  const handleMenuAvatarClick: MenuProps['onClick'] = (e) => {
    switch (Number(e.key)) {
      case MenuKey.LOGOUT:
        startTransition(() => {
          logout();
        });
        break;
      default:
        break;
    }
  };
  const [openDashProjects, setOpenDashProjects] = useState(false);
  const [openDashIssues, setOpenDashIssues] = useState(false);

  const handleOpenChangeDashProjects = (flag: boolean) => {
    setOpenDashProjects(flag);
    return;
  };

  const handleOpenChangeDashIssues = (flag: boolean) => {
    setOpenDashIssues(flag);
    return;
  };

  const handleHideDashProjects = () => {
    setIsModalOpenSearchProject(false);
    setOpenDashProjects(false);
  };

  const handleHideDashIssues = () => {
    setIsModalOpenSearchIssue(false);
    setOpenDashIssues(false);
  };

  const handleClickSettingProject = (id: number) => {
    setOpenDashProjects(false);
    history.push(`/project/${id}/setting`);
  };
  const handleClickProject = (id: number) => {
    setOpenDashProjects(false);
    history.push(`/project/${id}`);
  };
  const handleKeyWordProjects = useCallback(({ target }: { target: { value: string } }) => {
    setSearchValue.current(target.value);
  }, []);
  const handleKeyWordIssues = useCallback(({ target }: { target: { value: string } }) => {
    setSearchValueIssue.current(target.value);
  }, []);

  const handleRemoveWordProjects = useCallback(() => {
    setKeywordProjects('');
    inputRef.current.value = '';
    setPageIndexProjects(1);
  }, []);
  const handlePrevProjects = () => {
    if (pageIndexProjects !== 1) setPageIndexProjects(pageIndexProjects - 1);
  };
  const handleNextProjects = () => {
    if (pageIndexProjects !== dataProjects?.totalPages) setPageIndexProjects(pageIndexProjects + 1);
  };

  const itemDashAdd: MenuProps['items'] = [
    {
      key: 'ADD_PROJECT',
      label: <p>Add Project</p>,
      className: `${styles.dashAddProject}`,
      onClick: showModalAddProject,
    },
  ];

  const itemDashAdmin: MenuProps['items'] = [
    {
      key: 'USER_MANAGEMENT',
      label: <p>User Management</p>,
      onClick: () => history.push('/admin/user-management'),
    },
    {
      key: 'PROJECT_MANAGEMENT',
      label: <p>Project Management</p>,
      onClick: () => history.push('/admin/project-management'),
    },
    {
      key: 'ISSUE_MANAGEMENT',
      label: <p>Issue Management</p>,
      onClick: () => history.push('/admin/issue-management'),
    },
  ];

  const menuItemsLeftClient: MenuProps['items'] = [
    {
      key: 'DASH_ICON_MAIN',
      icon: <img src={icons.Logo} alt="company-icon" className={styles.companyIcon}></img>,
      label: <Link to={'/'}></Link>,
    },
    {
      key: 'DASH_BOARD',
      label: <Link to={'/dashboard'}>Dashboard</Link>,
    },
    {
      key: 'DASH_PROJECTS',
      label: (
        <div
          onClick={() => {
            setIsModalOpenSearchProject(true);
          }}
        >
          Projects
        </div>
      ),
    },
    {
      key: 'DASH_ISSUES',
      label: (
        <div
          onClick={() => {
            setIsModalOpenSearchIssue(true);
          }}
        >
          Issues
        </div>
      ),
    },
    {
      key: 'DASH_ICON_ADD',
      title: 'Add',
      label: (
        <Dropdown
          key={'DASH_ICON_ADD'}
          menu={{
            items: itemDashAdd,
            className: `${styles.dashAdd}`,
          }}
          trigger={['click']}
        >
          <img src={icons.Add} alt="company-icon" className={styles.iconAddIssue}></img>
        </Dropdown>
      ),
    },
  ];
  const menuItemsLeftAdmin: MenuProps['items'] = [
    {
      key: 'DASH_ICON_MAIN',
      icon: <img src={icons.Logo} alt="company-icon" className={styles.companyIcon}></img>,
      label: <Link to={'/'}></Link>,
    },
    ...itemDashAdmin,
  ];

  const itemsDashUser: MenuProps['items'] = [
    {
      key: 'DEFAULT',
      label: `Hello, ${profile?.name || 'User not name'}`,
      style: { pointerEvents: 'none', color: '#777' },
    },
    {
      key: MenuKey.PERSONAL_SETTINGS,
      label: 'Personal Settings',
      onClick: () => {
        history.push(`/profile`);
      },
    },
    {
      key: MenuKey.CHANGE_PASSWORD,
      label: 'Change password',
      onClick: () => {
        setOpenChangePassword(true);
      },
    },
    {
      key: MenuKey.LOGOUT,
      label: 'Logout',
      style: { borderTop: '1px solid #bdbdbd', marginTop: '5px' },
    },
  ];
  const menuItemsRight: MenuProps['items'] = [
    // {
    //   key: 'DASH_ICON_VIEW',
    //   icon: <img src={icons.View} alt="View-icon" className={styles.iconView} onClick={showDrawerView}></img>,
    //   title: 'View',
    // },
    {
      key: 'DASH_ICON_BELL',
      icon: (
        <img
          src={countNotiUnread?.data > 0 ? icons.BellPin : icons.Bell}
          alt="bell-icon"
          className={styles.iconBell}
          onClick={showDrawerNotification}
        ></img>
      ),
      title: `Notification`,
    },
    {
      key: 'DASH_ICON_INFO',
      icon: <img src={icons.Info} alt="info-icon" className={styles.iconInfo} onClick={showDrawerHelp}></img>,
      title: 'Help',
    },
    {
      key: 'DASH_USER',
      label: (
        <Dropdown
          menu={{
            items: itemsDashUser,
            onClick: handleMenuAvatarClick,
          }}
          trigger={['click']}
        >
          <div className={styles.avatarWrap}>
            <Avatar size={40} src={profile?.avatar50x50 ? profile.avatar50x50 : icons.HedLayer}></Avatar>
          </div>
        </Dropdown>
      ),
    },
  ];

  useEffect(() => {
    socket.on('NEW_NOTI', (data) => {
      queryClient.invalidateQueries([queryKeys.listNotification]);
      queryClient.invalidateQueries([queryKeys.countNotiUnread]);
    });

    return () => {
      socket.off('NEW_NOTI');
    };
  }, []);

  return (
    <div className={styles.dashboardHeader} ref={(e) => (containerRef.current = e)}>
      <div className={styles.dashboardMenu}>
        <div className={styles.leftDashboardMenu}>
          {profile && profile.role === UserRole.CLIENT ? (
            <Menu mode="horizontal" items={menuItemsLeftClient} style={{ minWidth: '800px' }} />
          ) : (
            <Menu mode="horizontal" items={menuItemsLeftAdmin} style={{ minWidth: '800px' }} />
          )}
        </div>
        <div className={styles.rightDashboardMenu}>
          <div className={styles.rightMenuItem}>
            <Menu mode="horizontal" items={menuItemsRight} />
          </div>
        </div>
      </div>
      <AddProject
        isModalOpen={isModalOpenAddProject}
        handleOk={handleOkAddProject}
        handleCancel={handleCancelAddProject}
      />
      <SearchProjects
        isModalOpenSearchProject={isModalOpenSearchProject}
        handleCancelSearchProject={handleCancelSearchProject}
        handleKeyWordProjects={handleKeyWordProjects}
        inputRef={inputRef}
        handleRemoveWordProjects={handleRemoveWordProjects}
        dataProjects={dataProjects}
        handleClickProject={handleClickProject}
        handleClickSettingProject={handleClickSettingProject}
        handleHideDashProjects={handleHideDashProjects}
        handleJoinProject={handleJoinProject}
        handlePrevProjects={handlePrevProjects}
        handleNextProjects={handleNextProjects}
        pageIndexProjects={pageIndexProjects}
      />
      <SearchIssues
        isModalOpenSearchIssue={isModalOpenSearchIssue}
        handleCancelSearchIssue={handleCancelSearchIssue}
        handleKeyWordIssues={handleKeyWordIssues}
        inputRef={inputRefIssue}
        dataIssues={dataIssues}
        handleHideDashIssues={handleHideDashIssues}
      />
      <Drawer title="Help" placement="right" onClose={onCloseHelp} open={openHelp}>
        <p>Some contents...</p>
      </Drawer>
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Notification ({countNotiUnread?.data || 0} unread)</span>
            <Checkbox
              onChange={(e) => {
                if (e.target.checked) {
                  setIsRead(!e.target.checked);
                } else {
                  setIsRead(undefined);
                }
              }}
            >
              Unread only
            </Checkbox>
            <span onClick={handleReadAllNoti} style={{ cursor: 'pointer' }}>
              Mark as read all
            </span>
          </div>
        }
        placement="right"
        onClose={onCloseNotification}
        open={openNotification}
        getContainer={containerRef.current}
        bodyStyle={{ padding: '0px', overflow: 'hidden' }}
        headerStyle={{ padding: '15px 0px' }}
      >
        <ListNotification isRead={isRead} onCloseNotification={onCloseNotification} />
      </Drawer>
      {/* <Drawer title="View" placement="right" onClose={onCloseView} open={openView}>
        <p>There are no watching issues. Click the Watch link in the Show issue page.</p>
      </Drawer> */}
      <Modal
        title="Change Password"
        open={openChangePassword}
        onCancel={() => setOpenChangePassword(false)}
        footer={null}
      >
        <Form
          name="formLogin"
          onFinish={(data) => {
            delete data.passwordConfirm;
            handleSubmitChangePassword(data);
          }}
          initialValues={{ remember: false }}
          autoComplete="off"
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 24 }}
          layout="vertical"
        >
          <Form.Item
            label={LabelDefault.Password}
            name="password"
            labelAlign="right"
            rules={[
              { required: true, message: Message.ERROR_REQUIRE_PASSWORD },
              () => ({
                validator(data, value: string) {
                  if (!value) {
                    return Promise.resolve();
                  }
                  if (!validate.isPassword(value)) {
                    return Promise.reject(new Error(Message.ERROR_FORMAT_PASSWORD));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="example123@a" maxLength={20} />
          </Form.Item>
          <Form.Item
            label="New password"
            name="newPassword"
            labelAlign="right"
            dependencies={['password']}
            rules={[
              { required: true, message: Message.ERROR_REQUIRE_PASSWORD },
              () => ({
                validator(data, value: string) {
                  if (!value) {
                    return Promise.resolve();
                  }
                  if (!validate.isPassword(value)) {
                    return Promise.reject(new Error(Message.ERROR_FORMAT_PASSWORD));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="example123@a" maxLength={20} />
          </Form.Item>
          <Form.Item
            label="New password confirm"
            name="passwordConfirm"
            labelAlign="right"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: Message.ERROR_REQUIRE_PASSWORD },
              ({ getFieldValue }) => ({
                validator(data, value: string) {
                  if (!value) {
                    return Promise.resolve();
                  }
                  if (!validate.isPassword(value)) {
                    return Promise.reject(new Error(Message.ERROR_FORMAT_PASSWORD));
                  }
                  if (getFieldValue('newPassword') !== value) {
                    return Promise.reject(Message.ERROR_NO_PASSWORD_MATCH);
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="example123@a" maxLength={20} />
          </Form.Item>

          <Form.Item style={{ marginBottom: '5px', textAlign: 'center' }} className={styles.submitLogin}>
            <div style={{ marginTop: '18.5px' }}>
              <button type="submit" className="btn btn-green" disabled={changePasswordMutation.isLoading}>
                Update
              </button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
