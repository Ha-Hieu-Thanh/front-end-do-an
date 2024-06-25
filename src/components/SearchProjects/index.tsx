import icons from '@/assets/icons';
import { Modal, message } from 'antd';
import { memo, useCallback, useRef } from 'react';
import styles from './styles.module.scss';
import { UserProjectRole, UserProjectStatus } from '@/connstant/enum/common';
import { Link } from 'react-router-dom';
import { history } from '@/App';
function SearchProjectModal(params: any) {
  return (
    <>
      <Modal
        title="Search Project"
        open={params.isModalOpenSearchProject}
        footer={null}
        onCancel={params.handleCancelSearchProject}
      >
        <div className={styles.modal}>
          <img src={icons.Search} alt="Search project" />
          <input
            type="search"
            placeholder="Search projects"
            onChange={params.handleKeyWordProjects}
            onClick={(e) => e.stopPropagation()}
            ref={params.inputRef}
          />
          {/* <img src={icons.Remove} alt="remove search project" onClick={params.handleRemoveWordProjects} /> */}
        </div>

        {params.dataProjects?.data?.map((item: any) => (
          <div
            className={styles.project}
            onClick={() => {
              history.push(`/project/${item.id}`);
              params.handleHideDashProjects();
            }}
          >
            <hr />
            <div className={styles.dashProjectsItem}>
              <div>
                <div
                  className={styles.dashProjectsItemTop}
                  onClick={() => {
                    if (item?.userProject?.status === UserProjectStatus.ACTIVE) {
                      params.handleClickProject(item.id);
                    }
                    if (item?.userProject?.status === UserProjectStatus.PENDING) {
                      message.error('You are not in the project, please join to continue');
                    }
                  }}
                >
                  <div>
                    <span className={styles.dashProjectsItemName}>{item.name}</span>
                    <span className={styles.dashProjectsItemKey}>[{item.key}]</span>
                  </div>
                  {[UserProjectRole.PM, UserProjectRole.SUB_PM].includes(item?.userProject?.role) && (
                    <img
                      onClick={(e) => {
                        if (item?.userProject?.role === UserProjectRole.STAFF) {
                          return;
                        }
                        e.stopPropagation();
                        params.handleClickSettingProject(item.id);
                      }}
                      src={icons.Setting}
                      alt="Setting detail project"
                      style={item?.userProject?.role === UserProjectRole.STAFF ? { cursor: 'no-drop' } : {}}
                    ></img>
                  )}
                </div>
              </div>
              {item?.userProject?.status === UserProjectStatus.ACTIVE && (
                <div className={styles.dashProjectsItemBottom}>
                  <Link onClick={params.handleHideDashProjects} to={`/project/${item.id}/add-issue`}>
                    Add Issue
                  </Link>
                  <Link onClick={params.handleHideDashProjects} to={`/project/${item.id}/issue`}>
                    Issue
                  </Link>
                  <Link onClick={params.handleHideDashProjects} to={`/project/${item.id}/board`}>
                    Board
                  </Link>
                  <Link onClick={params.handleHideDashProjects} to={`/project/${item.id}/wiki`}>
                    Wiki
                  </Link>
                </div>
              )}
              {item?.userProject?.status === UserProjectStatus.PENDING && (
                <div className={styles.joinToProject} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => params.handleJoinProject(UserProjectStatus.ACTIVE, item.id)}
                    type="submit"
                    className="btn btn-green"
                    style={{ height: '35px', color: 'black' }}
                  >
                    Confirm join to project
                  </button>
                  <button
                    onClick={() => params.handleJoinProject(UserProjectStatus.REJECT, item.id)}
                    type="submit"
                    className="btn btn-black"
                    style={{ height: '35px' }}
                  >
                    Reject join to project
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className={styles.dashProjectsLoad}>
          <div onClick={params.handlePrevProjects} className={params.pageIndexProjects === 1 ? styles.hidePrev : ''}>
            <img src={icons.Prev} alt="prev" /> <p>Prev</p>
          </div>
          <div
            onClick={params.handleNextProjects}
            className={params.pageIndexProjects === params.dataProjects?.totalPages ? styles.hidePrev : ''}
          >
            <p>Next</p> <img src={icons.Next} alt="next" />
          </div>
        </div>
      </Modal>
    </>
  );
}

export default memo(SearchProjectModal);
