import { ENDPOINTS } from '../../constants/endpoints';
import axiosClient from '../axiosClient';

export const fareApi = {
  listFare: () => () => {
    return axiosClient.get(ENDPOINTS.FARE_DETAILS);
  },
  addFare: (body) => () => {
    return axiosClient.post(ENDPOINTS.FARE_DETAILS, body);
  },
  deleteFare: () => () => {
    return axiosClient.delete(ENDPOINTS.FARE_DETAILS);
  },
  updateFare: (body) => () => {
    return axiosClient.put(ENDPOINTS.FARE_DETAILS, body);
  },
};
