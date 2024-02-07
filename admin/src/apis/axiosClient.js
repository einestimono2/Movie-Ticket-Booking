import axios from 'axios';
import { toast } from 'react-toastify';
import { REACT_APP_BASE_URL } from '../configs';
import { authApi } from './all/authApi';
import apiCaller from './apiCaller';

const axiosClient = axios.create({
  baseURL: REACT_APP_BASE_URL,
});
const errorHandler = (error) => {
  toast.error(error.message, { autoClose: 3000, theme: 'colored' });
};
axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('admin_access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },

  async (error) => {
    const originalRequest = error.config;
    if (!error.response) {
      toast.error(error.message, { autoClose: 3000, theme: 'colored' });
      console.error('Unknown error:', error.message);
    } else if (error.response.status === 401) {
      try {
        const refresh_token = localStorage.getItem('admin_refresh_token');
        const data = {
          refreshToken: refresh_token,
        };
        const response = await apiCaller({
          request: authApi.refreshToken(data),
          errorHandler,
        });
        console.log('Access token refreshed:', response);
        const { accessToken } = response.data;
        localStorage.setItem('admin_access_token', accessToken);
        originalRequest.headers = {
          Authorization: `Bearer ${accessToken}`,
        };
        return axiosClient(originalRequest);
      } catch (_error) {
        console.error('Refresh token failed:', _error);
      }
    }
    return Promise.reject(error.response.data);
  },
);

export default axiosClient;
