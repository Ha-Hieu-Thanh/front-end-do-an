import { REGEX_PASSWORD } from '@/connstant/enum/common';

export const validate = {
  isPassword: (password: string): boolean => {
    const length = password.length;
    if (length < 6 || length > 20 || !REGEX_PASSWORD.test(password)) {
      return false;
    }
    return true;
  },
};
