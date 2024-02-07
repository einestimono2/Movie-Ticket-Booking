import { ENDPOINTS } from '../../constants/endpoints';
import axiosClient from '../axiosClient';

export const reportApi = {
  revenueOverview: (access_token) => () => {
    return axiosClient.get(ENDPOINTS.REVENUE_OVERVIEW, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
  revenueByYear: (data, access_token) => () => {
    return axiosClient.get(ENDPOINTS.REVENUE_BY_YEAR, {
      params: data,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
};
