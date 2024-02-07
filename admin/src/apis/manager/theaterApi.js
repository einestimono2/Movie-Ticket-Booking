import { ENDPOINTS } from '../../constants/endpoints';
import axiosClient from '../axiosClient';

export const theaterApi = {
  updateTheater: (id, body) => () => {
    return axiosClient.put(`${ENDPOINTS.THEATER_DETAILS}/${id}`, body);
  },
  detailTheater: (id) => () => {
    return axiosClient.get(`${ENDPOINTS.THEATER_DETAILS}/${id}`);
  },
};
