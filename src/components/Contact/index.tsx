// import { IContact, contact } from '@/api/client/auth';
import { LabelDefault, Message } from '@/connstant/enum/common';
import { handleErrorMessage } from '@/i18n';
import { handleSuccessMessage } from '@/utils/helper/common';
import { useMutation } from '@tanstack/react-query';
import { Form, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import styles from './styles.module.scss';

export default function Contact({ handleCancel }: { handleCancel: () => void }) {
  return <></>;
  // const contactMutation = useMutation({
  //   mutationFn: (params: IContact) => contact(params),
  // });

  // const handleSubmitContact = (payload: IContact) => {
  //   contactMutation.mutate(payload, {
  //     onSuccess: () => {
  //       handleSuccessMessage('Contact success!');
  //       handleCancel();
  //     },
  //     onError: (error) => {
  //       handleErrorMessage(error);
  //     },
  //   });
  // };
  // return (
  //   <div className={styles.contact}>
  //     <Form
  //       name="formContact"
  //       onFinish={handleSubmitContact}
  //       initialValues={{ remember: false }}
  //       autoComplete="off"
  //       labelCol={{ span: 12 }}
  //       wrapperCol={{ span: 24 }}
  //       layout="vertical"
  //     >
  //       <div id="nameContact">
  //         <Form.Item
  //           label={'Name'}
  //           name="name"
  //           labelAlign="right"
  //           rules={[{ required: true, message: 'Required contact' }]}
  //         >
  //           <Input />
  //         </Form.Item>
  //       </div>
  //       <div id="emailContact">
  //         <Form.Item
  //           label={LabelDefault.Email}
  //           name="email"
  //           labelAlign="right"
  //           rules={[
  //             { required: true, message: Message.ERROR_REQUIRE_EMAIL },
  //             { type: 'email', message: Message.ERROR_FORMAT_EMAIL },
  //           ]}
  //         >
  //           <Input placeholder="email@example.com" />
  //         </Form.Item>
  //       </div>
  //       <div id="titleContact">
  //         <Form.Item
  //           label={'Title'}
  //           name="title"
  //           labelAlign="right"
  //           rules={[{ required: true, message: 'Required title' }]}
  //         >
  //           <Input />
  //         </Form.Item>
  //       </div>
  //       <div id="contentContact">
  //         <Form.Item
  //           label={'Content'}
  //           name="content"
  //           labelAlign="right"
  //           rules={[{ required: true, message: 'Required content' }]}
  //         >
  //           <TextArea rows={4} placeholder="maxLength is 3000" maxLength={3000} />
  //         </Form.Item>
  //       </div>
  //       <Form.Item style={{ marginBottom: '5px' }} className={styles.submitContact}>
  //         <div style={{ marginTop: '18.5px', display: 'flex', justifyContent: 'center' }}>
  //           <button type="submit" className="btn btn-green" onClick={() => handleCancel()}>
  //             Submit
  //           </button>
  //         </div>
  //       </Form.Item>
  //     </Form>
  //   </div>
  // );
}
