import axiosClient from './axiosClient';
import ENDPOINTS from '../constants/endpoints';

export const reviewApi = {
  createReview: (body, params) => () => {
    return axiosClient.post(ENDPOINTS.REVIEW_NEW, body, { params });
  },
  listReviewByTheater: (id, params) => () => {
    return axiosClient.get(`${ENDPOINTS.REVIEW_BY_THEATER}/${id}`, { params });
  },
  listReviewByMovie: (id, params) => () => {
    return axiosClient.get(`${ENDPOINTS.REVIEW_BY_MOVIE}/${id}`, { params });
  },
  deleteReview: (id) => () => {
    return axiosClient.delete(`${ENDPOINTS.REVIEW_DETAILS}/${id}`);
  },
  myReview: (id) => () => {
    return axiosClient.get(`${ENDPOINTS.REVIEW_DETAILS}/${id}`);
  },
};
