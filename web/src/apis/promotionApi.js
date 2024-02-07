import axiosClient from './axiosClient';
import ENDPOINTS from '../constants/endpoints';

export const promotionApi = {
  listPromotionByTheater: (id, params) => () => {
    return axiosClient.get(`${ENDPOINTS.PROMOTION_BY_THEATER}/${id}`, { params });
  },
  applyPromotion: (body, params) => () => {
    return axiosClient.post(ENDPOINTS.PROMOTION_APPLY, body, { params });
  },
};
