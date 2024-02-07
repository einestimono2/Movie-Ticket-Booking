import { ENDPOINTS } from '../../constants/endpoints';
import axiosClient from '../axiosClient';

export const reviewApi = {
  listReview: () => () => {
    return axiosClient.get(`${ENDPOINTS.REVIEW_MY_THEATER}`);
  },
  deleteReview: (id) => () => {
    return axiosClient.delete(`${ENDPOINTS.REVIEW_DETAILS}/${id}`);
  },
  activeReview: (id) => () => {
    return axiosClient.get(`${ENDPOINTS.REVIEW_ACTIVE}/${id}`);
  },
};
