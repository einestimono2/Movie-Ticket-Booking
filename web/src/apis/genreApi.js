import axiosClient from './axiosClient';
import ENDPOINTS from '../constants/endpoints';

export const genreApi = {
  listGenre: (params) => () => {
    return axiosClient.get(ENDPOINTS.GENRE_LIST, { params });
  },
};
