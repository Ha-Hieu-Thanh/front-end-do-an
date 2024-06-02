import { history } from '@/App';
import configs from '@/connstant/config';
import { handleErrorMessage } from '@/i18n';
import { logout } from '@/utils/helper/common';
import Axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = Axios.create({
  timeout: 3 * 60 * 1000,
});

let isRefreshing = false;
let failedQueue: any = [];
const processQueue = (error: any, token: string | null | undefined = null) => {
  failedQueue.forEach((prom: any) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const assignBaseUrlClient = (url?: string): string => {
  return `${configs.API_DOMAIN}/${url}`;
};

export const handleApiRefreshTokenByUrl = (url: string): string => {
  if (url.includes(assignBaseUrlClient(''))) {
    return assignBaseUrlClient('auth/request-access-token');
  }
  return assignBaseUrlClient('');
};

axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = Cookies.get('token');
    const projectId = Cookies.get('projectId');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (projectId) {
      config.headers.projectId = projectId;
    }
    return config;
  },
  (error: any) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalConfig = error.config;
    const { response } = error || {};
    const { data } = response || {};
    const { errorCode } = data || {};

    if (errorCode === 'Forbidden_Resource') {
      history.push('/forbidden-resource');
    }

    if (error.response.status !== 401) {
      handleErrorMessage(error);
      return Promise.reject(error);
    }

    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }

    if (((error.response && error.response.status === 401) || errorCode === 'Token_Expired') && !originalConfig.retry) {
      if (isRefreshing) {
        try {
          const queuePromise: any = await new Promise((resolve: any, reject: any) => {
            failedQueue.push({ resolve, reject });
          });
          originalConfig.headers.Authorization = `Bearer ${queuePromise.token}`;
          return axiosInstance(originalConfig);
        } catch (err) {
          return Promise.reject(err);
        }
      }
    }

    originalConfig.retry = true;
    isRefreshing = true;

    const urlRefreshToken = handleApiRefreshTokenByUrl(originalConfig.url);

    return Axios.post(urlRefreshToken, { refreshToken })
      .then((res: any) => {
        if ([200, 201].includes(res.status)) {
          const data = res.data.data;
          Cookies.set('token', data);
          originalConfig.headers.Authorization = `Bearer ${data}`;
          processQueue(null, data);
          return Axios(originalConfig);
        } else {
          logout();
          return Promise.reject(error);
        }
      })
      .catch((err: any) => {
        logout();
        processQueue(err, null);
        return Promise.reject(error);
      })
      .finally(() => {
        isRefreshing = false;
      });
  },
);

export default axiosInstance;

export const sendGet = (url: string, params?: any) => axiosInstance.get(url, { params }).then((res) => res.data);
export const sendPost = (url: string, params?: any, queryParams?: any) =>
  axiosInstance.post(url, params, { params: queryParams }).then((res) => res.data);
export const sendPut = (url: string, params?: any, queryParams?: any) =>
  axiosInstance.put(url, params, { params: queryParams }).then((res) => res.data);
export const sendPatch = (url: string, params?: any, queryParams?: any) =>
  axiosInstance.patch(url, params, { params: queryParams }).then((res) => res.data);
