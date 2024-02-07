import { ENDPOINTS } from '../../constants/endpoints';
import axiosClient from '../axiosClient';

export const productApi = {
  myTheater: () => () => {
    return axiosClient.get(ENDPOINTS.PRODUCT_LIST);
  },
  addProduct: (body) => () => {
    return axiosClient.post(ENDPOINTS.PRODUCT_CREATE, body);
  },
  deleteProduct: (id) => () => {
    return axiosClient.delete(`${ENDPOINTS.PRODUCT_DETAILTS}/${id}`);
  },
  updateProduct: (id, body) => () => {
    return axiosClient.put(`${ENDPOINTS.PRODUCT_DETAILTS}/${id}`, body);
  },
  detailProduct: (id) => () => {
    return axiosClient.get(`${ENDPOINTS.PRODUCT_DETAILTS}/${id}`);
  },
};
