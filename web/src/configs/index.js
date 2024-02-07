export const SERVER_URL = process.env.REACT_APP_MY_ENV
  ? process.env.REACT_APP_SERVER_DEV_URL
  : process.env.REACT_APP_SERVER_PRODUCT_URL;

export const SOCKET_URL = process.env.REACT_APP_MY_ENV
  ? process.env.REACT_APP_SOCKET_DEV_URL
  : process.env.REACT_APP_SOCKET_PRODUCT_URL;
