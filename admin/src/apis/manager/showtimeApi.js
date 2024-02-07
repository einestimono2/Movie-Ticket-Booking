import { ENDPOINTS } from '../../constants/endpoints';
import axiosClient from '../axiosClient';

export const showtimeApi = {
  listShowtime: () => () => {
    return axiosClient.get(`${ENDPOINTS.SHOWTIME_LIST}`);
  },
  createShowtime: (body) => () => {
    return axiosClient.post(ENDPOINTS.SHOWTIME_CREATE, body);
  },
  deleteShowtime: (id) => () => {
    return axiosClient.delete(`${ENDPOINTS.SHOWTIME_DETAILTS}/${id}`);
  },
  updateShowtime: (id, body) => () => {
    return axiosClient.patch(`${ENDPOINTS.SHOWTIME_DETAILTS}/${id}`, body);
  },
  detailShowtime: (id) => () => {
    return axiosClient.get(`${ENDPOINTS.SHOWTIME_DETAILTS}/${id}`);
  },
};
