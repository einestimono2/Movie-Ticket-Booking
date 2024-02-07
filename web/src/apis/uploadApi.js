import ENDPOINTS from '../constants/endpoints';
import axiosClient from './axiosClient';

export const uploadApi = {
  uploadFiles: (data) => () => {
    return axiosClient.post(ENDPOINTS.UPLOAD_FILES, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadFile: (data) => () => {
    return axiosClient.post(ENDPOINTS.UPLOAD_FILE, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
