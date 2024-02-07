import { ENDPOINTS } from '../../constants/endpoints';
import axiosClient from '../axiosClient';

export const roomApi = {
  createRoom: (body) => () => {
    return axiosClient.post(ENDPOINTS.CREATE_ROOM, body);
  },
  updateRoom: (id, body) => () => {
    return axiosClient.put(`${ENDPOINTS.ROOM_DETAILS}/${id}`, body);
  },
  listRoom: () => () => {
    return axiosClient.get(ENDPOINTS.LIST_ROOM);
  },
  roomDetails: (id) => () => {
    return axiosClient.get(`${ENDPOINTS.ROOM_DETAILS}/${id}`);
  },
  deleteRoom: (id) => () => {
    return axiosClient.delete(`${ENDPOINTS.ROOM_DETAILS}/${id}`);
  },
};
