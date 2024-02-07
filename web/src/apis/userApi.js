import axiosClient from './axiosClient';
import ENDPOINTS from '../constants/endpoints';

export const userApi = {
  getProfile: () => () => {
    return axiosClient.get(ENDPOINTS.USER_PROFILE);
  },
  login: (body) => () => {
    return axiosClient.post(ENDPOINTS.USER_LOGIN, body);
  },
  logout: () => () => {
    return axiosClient.get(ENDPOINTS.USER_LOGOUT);
  },
  register: (body) => () => {
    return axiosClient.post(ENDPOINTS.USER_REGISTER, body);
  },
  resend_activate: (body) => () => {
    return axiosClient.post(ENDPOINTS.USER_RESEND_ACTIVATE, body);
  },
  activate: (body) => () => {
    return axiosClient.post(ENDPOINTS.USER_ACTIVATE, body);
  },
  refreshToken: (data) => () => {
    return axiosClient.post(ENDPOINTS.REFRESH_TOKEN, data);
  },
  forgotPassword: (data) => () => {
    return axiosClient.post(ENDPOINTS.USER_FOTGOT_PASSWORD, data);
  },
  resetPassword: (data) => () => {
    return axiosClient.put(ENDPOINTS.USER_RESET_PASSWORD, data);
  },
  updatePassword: (data) => () => {
    return axiosClient.patch(ENDPOINTS.USER_UPDATE_PASSWORD, data);
  },
  updateProfile: (data) => () => {
    return axiosClient.patch(ENDPOINTS.USER_PROFILE, data);
  },
  updateAvatar: (data) => () => {
    return axiosClient.patch(ENDPOINTS.USER_UPDATE_AVATAR, data);
  },
  toggleFavoriteMovie: (id) => () => {
    return axiosClient.get(`${ENDPOINTS.USER_FAVORITE_MOVIE}/${id}`);
  },
  toggleFavoriteTheater: (id) => () => {
    return axiosClient.get(`${ENDPOINTS.USER_FAVORITE_THEATER}/${id}`);
  },
  myFavorite: () => () => {
    return axiosClient.get(ENDPOINTS.USER_MY_FAVORITE);
  },
};
