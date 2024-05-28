import { history } from '@/App';
import { clientRegister } from '@/api/client/auth';
import { Calendar, Chat, Logo, Task, eyeCloseIcon, eyeOpenIcon } from '@/assets';
import { LabelDefault, Message } from '@/connstant/enum/common';
import { handleErrorMessage } from '@/i18n';
import { handleSuccessMessage } from '@/utils/helper/common';
import { validate } from '@/utils/helper/validate';
import { useMutation } from '@tanstack/react-query';
import { Form, Input } from 'antd';
import Cookies from 'js-cookie';
import { Navigate } from 'react-router-dom';
import styles from './styles.module.scss';

interface IPayloadRegister {
  email: string;
  password: string;
  passwordConfirm: string;
}
export default function RegisterForm() {
  const registerMutation = useMutation({
    mutationFn: (params: { email: string; password: string }) => clientRegister(params),
  });

  const handleSubmitRegister = (payload: IPayloadRegister) => {
    const { passwordConfirm, ...params } = payload;
    registerMutation.mutate(params, {
      onSuccess: (data) => {
        history.push('/login');
        handleSuccessMessage('Register success! Check your email to complete your account registration');
      },
      onError: (error) => {
        handleErrorMessage(error);
      },
    });
  };

  const isAuthenticated = !!Cookies.get('token');
  if (isAuthenticated) return <Navigate to="/" />;

  return (
    <div>
      <div className={styles.register}>
        <div className={styles.registerHeader}>
          <img src={Logo}></img>
          <a href="">Contact Us</a>
        </div>
        <div className={styles.registerBody}>
          <h1>Register Project Manage System account</h1>

          <div className={styles.formContainer}>
            <Form
              name="formRegister"
              onFinish={handleSubmitRegister}
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

              <Form.Item style={{ marginBottom: '5px' }} className={styles.submitRegister}>
                <div style={{ marginTop: '18.5px' }}>
                  <button type="submit" className="btn btn-green" disabled={registerMutation.isLoading}>
                    Register
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
