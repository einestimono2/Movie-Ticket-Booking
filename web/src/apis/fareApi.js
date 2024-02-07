import axiosClient from './axiosClient';
import ENDPOINTS from '../constants/endpoints';

export const fareApi = {
  getDetails: (id, params) => () => {
    return axiosClient.get(`${ENDPOINTS.FARE_DETAILS}/${id}`, { params });
  },
};
