import { history } from '@/App';
import styles from './styles.module.scss';
import { Modal } from 'antd';
import { startTransition, useState } from 'react';
import Contact from '../Contact';
import { logout } from '@/utils/helper/common';

export default function ForbiddenResource() {
  const [isModalOpenContact, setIsModalOpenContact] = useState(false);
  const handleCancelContact = () => {
    setIsModalOpenContact(false);
  };
  return (
    <div className={styles.comingSoon}>
      <div className={styles.bodyComingSoon}>
        <div className={styles.container}>
          <h1>
            Forbidden Resource <br />
            <br /> Your account or project has been blocked. <br /> Please contact the system for more detailed
            information. <br />
            <button
              style={{ fontSize: '20px', cursor: 'pointer' }}
              onClick={() => {
                history.push('/');
              }}
            >
              Click back to home
            </button>
            <p onClick={() => setIsModalOpenContact(true)} style={{ fontSize: '20px', cursor: 'pointer' }}>
              Contact Us
            </p>
            <p
              onClick={() => {
                startTransition(() => {
                  logout();
                });
              }}
              style={{ fontSize: '20px', cursor: 'pointer' }}
            >
              Logout
            </p>
          </h1>
        </div>
      </div>
      <Modal
        footer={null}
        width={1000}
        title="Contact"
        open={isModalOpenContact}
        onCancel={() => setIsModalOpenContact(false)}
      >
        <Contact handleCancel={handleCancelContact}></Contact>
      </Modal>
    </div>
  );
}
