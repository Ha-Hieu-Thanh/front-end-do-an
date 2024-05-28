import { INoticeProps } from '@/connstant/interface';
import { notification } from 'antd';

const CustomNotification = ({ type, message, description }: INoticeProps) => {
  notification.destroy();
  return notification[type]({
    message,
    description,
  });
};

export default CustomNotification;
