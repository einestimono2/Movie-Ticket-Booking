import axiosClient from './axiosClient';
import ENDPOINTS from '../constants/endpoints';

export const showtimeApi = {
  listShowtimeByMovie: (id, params) => () => {
    return axiosClient.get(`${ENDPOINTS.SHOWTIME_BY_MOVIE}/${id}`, { params });
  },
  listShowtimeByTheater: (id, params) => () => {
    return axiosClient.get(`${ENDPOINTS.SHOWTIME_BY_THEATER}/${id}`, { params });
  },
  getDetails: (id, params) => () => {
    return axiosClient.get(`${ENDPOINTS.SHOWTIME_DETAILS}/${id}`, { params });
  },
};
