import axiosClient from './axiosClient';
import ENDPOINTS from '../constants/endpoints';

export const personApi = {
  getPersonDetails: (id, params) => () => {
    return axiosClient.get(`${ENDPOINTS.PERSON_DETAILS}/${id}`, { params });
  },
};
