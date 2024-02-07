import { ENDPOINTS } from '../../constants/endpoints';
import axiosClient from '../axiosClient';

export const personApi = {
  listPerson: (data, access_token) => () => {
    return axiosClient.get(ENDPOINTS.LIST_PERSON, {
      headers: { Authorization: `Bearer ${access_token}` },
      params: data,
    });
  },
};
