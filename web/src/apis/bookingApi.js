import axiosClient from './axiosClient';
import ENDPOINTS from '../constants/endpoints';

export const bookingApi = {
  createBooking: (body) => () => {
    return axiosClient.post(ENDPOINTS.BOOKING_CREATE, body);
  },
  myBooking: (params) => () => {
    return axiosClient.get(ENDPOINTS.BOOKING_MY, { params });
  },
};
