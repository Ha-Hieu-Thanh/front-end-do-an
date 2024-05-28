import configs from '@/connstant/config';
import { Environment } from '@/connstant/enum/common';
import { message } from 'antd';
import isString from 'lodash/isString';
export interface IFormatErrorObject {
  success: boolean;
  statusCode: number;
  errorCode: string;
  errorMessage?: string;
  devMessage?: string;
  payload?: any;
}

export const handleErrorMessage = (error: any) => {
  const dataError: IFormatErrorObject = error?.response?.data as any;
  message.destroy();
  message.error(getErrorMessage(dataError));
  if (configs.APP_ENV !== Environment.Production) {
    console.log({ error });
  }
};
export const getErrorMessage = (dataError: IFormatErrorObject) => {
  if (isString(dataError?.errorMessage)) {
    return dataError?.errorMessage;
  }

  return dataError?.errorCode;
};
