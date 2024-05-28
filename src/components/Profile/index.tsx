import { IUpdateMyProfile, getMyProfile, updateMyProfile } from '@/api/client/profile';
import icons from '@/assets/icons';
import { Gender } from '@/connstant/enum/common';
import queryKeys from '@/connstant/queryKeys';
import { handleSuccessMessage } from '@/utils/helper/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatePicker, Form, Input, Radio, Upload } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { handleErrorMessage } from '@/i18n';
import { uploadFile } from '@/api/client/upload';

const getBase64 = (img: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.readAsDataURL(img);
  });

export default function Profile() {
  const [image, setImage] = useState<any>([]);
  const [imageUrl, setImageUrl] = useState<File>();

  const { data: profile, refetch: refetchProfile } = useQuery<any>([queryKeys.profileClient], getMyProfile);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const updateMyProfileMutation = useMutation({
    mutationFn: (variables: { payload: IUpdateMyProfile }) => updateMyProfile(variables.payload),
  });
  const uploadFileMutation = useMutation({
    mutationFn: (variables: { payload: File }) => uploadFile(variables.payload),
  });

  useEffect(() => {
    form.setFieldsValue({
      email: profile?.data?.email,
      gender: profile?.data?.gender,
      name: profile?.data?.name,
      address: profile?.data?.address,
      birthday: profile?.data?.birthday ? dayjs(profile?.data?.birthday, 'YYYY-MM-DD') : null,
      phone: profile?.data?.phone,
    });
    setImage(profile?.data?.avatar400x400);
  }, [profile?.data]);

  const onFinish = async (payload: any) => {
    delete payload.email;
    if (payload.birthday) {
      payload.birthday = dayjs(payload.birthday).startOf('D').format('YYYY-MM-DD');
    }

    if (imageUrl) {
      const image = await uploadFile(imageUrl);
      payload.avatar = image.data.results[0];
    }
    updateMyProfileMutation.mutate(
      { payload },
      {
        onSuccess: () => {
          handleSuccessMessage('Update my profile success!');
          queryClient.invalidateQueries([queryKeys.profileClient]);
        },
        onError: (error) => {
          handleErrorMessage(error);
        },
      },
    );
  };

  return (
    <div className={styles.profile} style={{ textAlign: 'center' }}>
      <span style={{ fontWeight: '500', fontSize: '2rem' }}>User Information</span>

      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 28 }}
        layout="horizontal"
        style={{ maxWidth: 690, margin: '0px auto', marginTop: '30px' }}
        form={form}
        onFinish={onFinish}
      >
        <Form.Item valuePropName="fileList">
          <div className={styles.boxImages}>
            <div
              className={`${styles.image} ${styles.imageEdit} cursor`}
              style={{ cursor: 'pointer' }}
              title="Edit avatar"
            >
              <Upload
                name="avatar"
                listType="picture"
                showUploadList={false}
                beforeUpload={(file) => {
                  getBase64(file).then((data) => {
                    console.log({ file, data });
                    setImageUrl(file);
                    setImage(data);
                  });
                  return false;
                }}
              >
                {image ? (
                  <img style={{ width: '300px', height: '300px' }} src={image} alt="" className="img-scaledown" />
                ) : (
                  <img style={{ width: '300px', height: '300px' }} src={icons.HedLayer} alt="" className="img-cover" />
                )}
                {/* <div className="ant-image-mask">
                  <div className="ant-image-mask-info">
                    <span role="img" aria-label="eye" className="anticon anticon-eye">
                      <EditOutlined />
                    </span>
                  </div>
                </div> */}
              </Upload>
            </div>
          </div>
        </Form.Item>

        <Form.Item label="Email Address" name="email">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Gender" name="gender" style={{ textAlign: 'start' }}>
          <Radio.Group>
            <Radio value={Gender.FEMALE}> Female </Radio>
            <Radio value={Gender.MALE}> Male </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Name" name="name">
          <Input />
        </Form.Item>

        <Form.Item label="Address" name="address">
          <Input />
        </Form.Item>

        <Form.Item label="Birthday" name="birthday" style={{ textAlign: 'start' }}>
          <DatePicker />
        </Form.Item>

        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>

        <Form.Item style={{ marginBottom: '5px' }}>
          <div style={{ marginTop: '18.5px', textAlign: 'center', height: '35px' }}>
            <button type="submit" className="btn btn-green" style={{ height: '35px' }}>
              Save
            </button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}
