import { io } from 'socket.io-client';

import { SOCKET_URL } from './configs/index';

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export default socket;
