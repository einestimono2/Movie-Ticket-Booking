import { ENDPOINTS } from '../../constants/endpoints';
import axiosClient from '../axiosClient';

export const movieApi = {
  listMovie: (data, access_token) => () => {
    return axiosClient.get(ENDPOINTS.LIST_MOVIE, {
      headers: { Authorization: `Bearer ${access_token}` },
      params: data,
    });
  },
  createMovie: (data, access_token) => () => {
    return axiosClient.post(ENDPOINTS.CREATE_MOVIE, data, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
  },
  deleteMovie: (id, access_token) => () => {
    return axiosClient.delete(`${ENDPOINTS.MOVIE_DETAILS}/${id}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
  },
};
