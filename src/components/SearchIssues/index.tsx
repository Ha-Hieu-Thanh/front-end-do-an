import icons from '@/assets/icons';
import { Modal } from 'antd';
import { memo } from 'react';
import styles from './styles.module.scss';
import { history } from '@/App';

function SearchIssueModal(params: any) {
  return (
    <>
      <Modal
        title="Search Issues"
        open={params.isModalOpenSearchIssue}
        footer={null}
        onCancel={params.handleCancelSearchIssue}
      >
        <div className={styles.modal}>
          <img src={icons.Search} alt="Search issues" />
          <input
            type="search"
            placeholder="Search issues"
            onChange={params.handleKeyWordIssues}
            onClick={(e) => e.stopPropagation()}
            ref={params.inputRef}
          />
        </div>
        {params.dataIssues?.data?.map((item: any) => (
          <div
            className={styles.issue}
            onClick={() => {
              params.handleHideDashIssues();
              history.push(`/project/${item.project.id}/issue/${item.id}`);
            }}
          >
            <hr />
            <div className={styles.issueTop}>
              <span className={styles.issueName}>{item.subject}</span>
              <span className={styles.issueKey}>
                [{item.project.key}-{item.id}]
              </span>
            </div>
          </div>
        ))}
        <div style={{ marginBottom: 30 }}></div>
      </Modal>
    </>
  );
}

export default memo(SearchIssueModal);
