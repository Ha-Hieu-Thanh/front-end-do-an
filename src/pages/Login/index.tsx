import { history } from '@/App';
import { IClientLogin, clientLogin } from '@/api/client/auth';
import { Calendar, Chat, Logo, Task, eyeCloseIcon, eyeOpenIcon } from '@/assets';
import configs from '@/connstant/config';
import { LabelDefault, Message } from '@/connstant/enum/common';
import { handleErrorMessage } from '@/i18n';
import { validate } from '@/utils/helper/validate';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Checkbox, Form, Input, Modal } from 'antd';
import Cookies from 'js-cookie';
import { startTransition, useState } from 'react';
import { Navigate } from 'react-router-dom';
import styles from './styles.module.scss';
import queryKeys from '@/connstant/queryKeys';
import Contact from '@/components/Contact';
interface IPayloadLogin {
  email: string;
  password: string;
  remember: boolean;
}
export default function LoginForm() {
  const loginMutation = useMutation({
    mutationFn: (params: IClientLogin) => clientLogin(params),
  });
  const queryClient = useQueryClient();
  const [isModalOpenContact, setIsModalOpenContact] = useState(false);

  const handleCancelContact = () => {
    setIsModalOpenContact(false);
  };
  const handleSubmitLogin = (payload: IPayloadLogin) => {
    const { remember, ...params } = payload;

    loginMutation.mutate(
      { ...params },
      {
        onSuccess: (data) => {
          const { token, refreshToken } = data.data;
          Cookies.set('token', token, {
            expires: payload.remember ? 999999 : undefined,
          });
          Cookies.set('refreshToken', refreshToken, {
            expires: payload.remember ? 999999 : undefined,
          });
          queryClient.invalidateQueries([queryKeys.projectList]);
          history.push('/');
        },
        onError: (error) => {
          handleErrorMessage(error);
        },
      },
    );
  };

  const handleRegister = () => {
    startTransition(() => {
      history.push('/register');
    });
  };

  const handleForgotPassword = () => {
    startTransition(() => {
      history.push('/forgot-password');
    });
  };

  const isAuthenticated = !!Cookies.get('token');
  if (isAuthenticated) return <Navigate to="/" />;

  return (
    <div>
      <div className={styles.login}>
        <div className={styles.loginHeader}>
          <img src={Logo}></img>
          <a style={{ cursor: 'pointer' }} onClick={() => setIsModalOpenContact(true)}>
            Contact Us
          </a>
        </div>
        <div className={styles.loginBody}>
          <h1>Login to Project Manage System</h1>
          <div className={styles.formContainer}>
            <div className={styles.titleText}>
              <h3>
                Login or{' '}
                <a onClick={handleRegister} style={{ color: '#4caf93' }}>
                  create an account
                </a>
              </h3>
            </div>

            <Form
              name="formLogin"
              onFinish={handleSubmitLogin}
              initialValues={{ remember: false }}
              autoComplete="off"
              labelCol={{ span: 12 }}
              wrapperCol={{ span: 24 }}
              layout="vertical"
            >
              <div id="emailLogin">
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
                  <Input placeholder="email@example.com" />
                </Form.Item>
              </div>
              <div id="idPassword">
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
                    placeholder="example123@a"
                    maxLength={20}
                    iconRender={(visible) => (visible ? <img src={eyeOpenIcon} /> : <img src={eyeCloseIcon} />)}
                  />
                </Form.Item>
              </div>

              <Form.Item name="remember" valuePropName="checked" className={styles.rememberOrForgot}>
                <Checkbox className={styles.checkBox}>Remember me</Checkbox>
              </Form.Item>

              <Form.Item style={{ marginBottom: '5px' }} className={styles.submitLogin}>
                <div style={{ marginTop: '18.5px' }}>
                  <button type="submit" className="btn btn-green" disabled={loginMutation.isLoading}>
                    Login
                  </button>
                </div>
              </Form.Item>
              <div className={styles.forgotPassword}>
                <a onClick={handleForgotPassword}>Forgot password</a>
              </div>
            </Form>
          </div>
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
