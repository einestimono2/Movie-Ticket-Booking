import { ENDPOINTS } from '../../constants/endpoints';
import axiosClient from '../axiosClient';

export const promotionApi = {
  listPromotion: () => () => {
    return axiosClient.get(ENDPOINTS.PROMOTION_LIST_BY_THEATER);
  },
  addPromotion: (body) => () => {
    return axiosClient.post(ENDPOINTS.PROMOTION_CREATE, body);
  },
  deletePromotion: (id) => () => {
    return axiosClient.delete(`${ENDPOINTS.PROMOTION_DETAILS}/${id}`);
  },
  updatePromotion: (id, body) => () => {
    return axiosClient.patch(`${ENDPOINTS.PROMOTION_DETAILS}/${id}`, body);
  },
  detailPromotion: (id) => () => {
    return axiosClient.get(`${ENDPOINTS.PROMOTION_DETAILS}/${id}`);
  },
};
