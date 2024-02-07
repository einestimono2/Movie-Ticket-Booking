import axios from 'axios';
import { toast } from 'react-toastify';

import { SERVER_URL } from '../configs';
import apiCaller from './apiCaller';
import { userApi } from './userApi';
import { store } from '../redux/store';
import { setProfile } from '../redux/reducer/userReducer';

const axiosClient = axios.create({
  baseURL: SERVER_URL,
});

const errorHandler = (error) => {
  toast.error(error.message, { autoClose: 3000, theme: 'colored' });
};

axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('access_token');

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
    console.log(error);

    if (error.response.data.ec === 419 && !originalRequest._retry) {
      originalRequest._retry = true;

      const response = await apiCaller({
        request: userApi.refreshToken({
          refreshToken: localStorage.getItem('refresh_token'),
        }),
        errorHandler,
      });

      if (response) {
        console.log('Access token refreshed:', response?.data?.accessToken);
        const { accessToken } = response.data;
        localStorage.setItem('access_token', accessToken);
        originalRequest.headers = {
          Authorization: `Bearer ${accessToken}`,
        };
      } else {
        // Refresh token hết hạn
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        store.dispatch(setProfile(undefined));

        return Promise.reject(error.response.data);
      }

      return axiosClient(originalRequest);
    }

    return Promise.reject(error.response.data);
  },
);

export default axiosClient;
