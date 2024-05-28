import { history } from '@/App';
import { IClientForgotPassword, clientForgotPassword } from '@/api/client/auth';
import { Calendar, Chat, Logo, Task } from '@/assets';
import { LabelDefault, Message } from '@/connstant/enum/common';
import { handleErrorMessage } from '@/i18n';
import { handleSuccessMessage } from '@/utils/helper/common';
import { useMutation } from '@tanstack/react-query';
import { Form, Input } from 'antd';
import Cookies from 'js-cookie';
import { Navigate } from 'react-router-dom';
import styles from './styles.module.scss';

export default function ForgotPassword() {
  const forgotPasswordMutation = useMutation({
    mutationFn: (params: { email: string }) => clientForgotPassword(params),
  });

  const handleSubmitForgotPassword = (payload: IClientForgotPassword) => {
    forgotPasswordMutation.mutate(payload, {
      onSuccess: (data) => {
        history.push('/login');
        handleSuccessMessage('Forgot password success! Check your email to confirm change password!');
      },
      onError: (error) => {
        history.push('/login');
        handleErrorMessage(error);
      },
    });
  };

  const isAuthenticated = !!Cookies.get('token');
  if (isAuthenticated) return <Navigate to="/" />;

  return (
    <div>
      <div className={styles.forgotPassword}>
        <div className={styles.forgotPasswordHeader}>
          <img src={Logo}></img>
          <a href="">Contact Us</a>
        </div>
        <div className={styles.forgotPasswordBody}>
          <h1>Forgot Password task-manager account</h1>
          <h2>Manager Task, Calendar, and Chat with your task-manager account</h2>
          <div className={styles.productLogoList}>
            <img src={Task}></img>
            <img src={Calendar}></img>
            <img src={Chat}></img>
          </div>

          <div className={styles.formContainer}>
            <Form
              name="formForgotPassword"
              onFinish={handleSubmitForgotPassword}
              autoComplete="off"
              labelCol={{ span: 12 }}
              wrapperCol={{ span: 24 }}
              layout="vertical"
            >
              <Form.Item
                label={LabelDefault.Email}
                name="email"
                labelAlign="right"
                className={styles.formItemLabel}
                rules={[
                  { required: true, message: Message.ERROR_REQUIRE_EMAIL },
                  { type: 'email', message: Message.ERROR_FORMAT_EMAIL },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item style={{ marginBottom: '5px' }} className={styles.submitForgotPassword}>
                <div style={{ marginTop: '18.5px' }}>
                  <button type="submit" className="btn btn-green" disabled={forgotPasswordMutation.isLoading}>
                    Forgot password
                  </button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
