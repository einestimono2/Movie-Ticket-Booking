import axiosClient from './axiosClient';
import ENDPOINTS from '../constants/endpoints';

export const productApi = {
  listProductByTheater: (id, params) => () => {
    return axiosClient.get(`${ENDPOINTS.PRODUCT_BY_THEATER}/${id}`, { params });
  },
};
