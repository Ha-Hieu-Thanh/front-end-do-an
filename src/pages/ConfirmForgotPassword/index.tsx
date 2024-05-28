import { history } from '@/App';
import { clientConfirmForgotPassword } from '@/api/client/auth';
import { Calendar, Chat, Logo, Task, eyeCloseIcon, eyeOpenIcon } from '@/assets';
import { LabelDefault, Message } from '@/connstant/enum/common';
import { handleErrorMessage } from '@/i18n';
import { handleSuccessMessage } from '@/utils/helper/common';
import { validate } from '@/utils/helper/validate';
import { useMutation } from '@tanstack/react-query';
import { Form, Input } from 'antd';
import Cookies from 'js-cookie';
import { Navigate, useLocation } from 'react-router-dom';
import styles from './styles.module.scss';

interface IPayloadForgotPassword {
  email: string;
  password: string;
  passwordConfirm: string;
}
export default function ConfirmForgotPasswordForm() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const inviteCode = searchParams.get('inviteCode');
  const email = searchParams.get('email');

  const confirmForgotPasswordMutation = useMutation({
    mutationFn: (params: { tokenForgotPassword: string; newPassword: string }) => clientConfirmForgotPassword(params),
  });

  const handleSubmitForgotPassword = (payload: IPayloadForgotPassword) => {
    const { email, password, passwordConfirm } = payload;
    if (inviteCode) {
      confirmForgotPasswordMutation.mutate(
        { newPassword: password, tokenForgotPassword: inviteCode },
        {
          onSuccess: (data) => {
            history.push('/login');
            handleSuccessMessage('Change password success!');
          },
          onError: (error) => {
            handleErrorMessage(error);
          },
        },
      );
    }
  };

  const isAuthenticated = !!Cookies.get('token');
  if (isAuthenticated || !inviteCode || !email) return <Navigate to="/" />;

  return (
    <div>
      <div className={styles.forgotPassword}>
        <div className={styles.forgotPasswordHeader}>
          <img src={Logo}></img>
          <a href="">Contact Us</a>
        </div>
        <div className={styles.forgotPasswordBody}>
          <h1>Confirm forgot password task-manager account</h1>
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
              initialValues={{ email }}
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
                <Input disabled={true} />
              </Form.Item>

              <Form.Item
                label={LabelDefault.Password}
                name="password"
                labelAlign="right"
                className={styles.formItemLabel}
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
                <Input.Password
                  maxLength={20}
                  iconRender={(visible) => (visible ? <img src={eyeOpenIcon} /> : <img src={eyeCloseIcon} />)}
                />
              </Form.Item>

              <Form.Item
                label={LabelDefault.PasswordConfirm}
                name="passwordConfirm"
                labelAlign="right"
                className={styles.formItemLabel}
                dependencies={['password']}
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
                      if (getFieldValue('password') !== value) {
                        return Promise.reject(Message.ERROR_NO_PASSWORD_MATCH);
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input.Password
                  maxLength={20}
                  iconRender={(visible) => (visible ? <img src={eyeOpenIcon} /> : <img src={eyeCloseIcon} />)}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '5px' }} className={styles.submitForgotPassword}>
                <div style={{ marginTop: '18.5px' }}>
                  <button type="submit" className="btn btn-green" disabled={confirmForgotPasswordMutation.isLoading}>
                    Confirm forgot password
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
