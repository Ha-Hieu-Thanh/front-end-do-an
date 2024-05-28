import { history } from '@/App';
import CustomNotification from '@/components/CustomNotification';
import Cookies from 'js-cookie';
import moment from 'moment';

export const logout = () => {
  Cookies.remove('token');
  Cookies.remove('refreshToken');
  Cookies.remove('projectId');
  history.push('/login');
};
export const handleSuccessMessage = (mes: string) => {
  CustomNotification({
    type: 'success',
    message: mes,
    description: '',
  });
};
export const getSerialNumber = (index = 1, pageIndex = 1, pageSize = 10, hasZeroStart?: boolean) => {
  let stt = index + 1 + pageIndex * pageSize - pageSize;
  let result = String(stt);

  if (hasZeroStart) {
    result = stt < 10 ? `0${stt}` : result;
  }

  return result;
};
export function replaceNumberWithDots(inputString: string, index = 40) {
  const key = inputString.charAt(index);

  if (key === '') {
    return inputString;
  }

  const result = inputString.slice(0, index) + '...';
  return result;
}
export function handleLastNameMember(name: string) {
  const split = name.split(' ');

  return split[split.length - 1];
}

export function formatTimestamp(timestamp: number | string) {
  const date = moment(timestamp);
  const today = moment();

  if (date.isSame(moment(), 'day')) {
    return date.format('h:mm A');
  }
  if (date.isSame(today, 'year')) {
    return date.format('M/D');
  }
  if (!date.isSame(today, 'year')) {
    return date.format('YYYY/M/D');
  }
}

export function convertTimeToRelative(dateString: string) {
  const inputDate = new Date(dateString);
  const currentDate = new Date();

  const timeDifference = moment(currentDate).diff(inputDate, 'minute');
  const minutes = 60;
  const hours = minutes * 24;
  const months = hours * 30;

  if (timeDifference < 1) {
    return `now`;
  } else if (timeDifference < minutes) {
    const minutesAgo = Math.floor(timeDifference);
    return `${minutesAgo} minutes ago`;
  } else if (timeDifference < hours) {
    const hoursAgo = Math.floor(timeDifference / minutes);
    return `about ${hoursAgo} hours ago`;
  } else if (inputDate.getDate() === currentDate.getDate() - 1 && inputDate.getMonth() === currentDate.getMonth()) {
    return 'yesterday';
  } else if (inputDate.getMonth() === currentDate.getMonth()) {
    const daysAgo = Math.floor(timeDifference / hours);
    return `${daysAgo + 1} days ago`;
  } else {
    const monthsAgo = Math.floor(timeDifference / months);
    return `${monthsAgo || 1} months ago`;
  }
}

export function convertUTCToGMTPlus7(inputISOStringDate: string) {
  return moment(inputISOStringDate).utcOffset(7).format('YYYY-MM-DD HH:mm:ss');
}
