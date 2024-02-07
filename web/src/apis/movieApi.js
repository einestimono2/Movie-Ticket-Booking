import axiosClient from './axiosClient';
import ENDPOINTS from '../constants/endpoints';

export const movieApi = {
  listMovieNowShowing: (params) => () => {
    return axiosClient.get(ENDPOINTS.MOVIE_NOW_SHOWING, { params });
  },
  listMovieComingSoon: (params) => () => {
    return axiosClient.get(ENDPOINTS.MOVIE_COMING_SOON, { params });
  },
  listMovieSneakShow: (params) => () => {
    return axiosClient.get(ENDPOINTS.MOVIE_SNEAK_SHOW, { params });
  },
  listMostRateMovie: (params) => () => {
    return axiosClient.get(ENDPOINTS.MOVIE_MOST_RATE, { params });
  },
  getMovieDetails: (id) => () => {
    return axiosClient.get(`${ENDPOINTS.MOVIE_DETAILS}/${id}`);
  },
};
