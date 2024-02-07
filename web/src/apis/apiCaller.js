import { message } from 'antd';
// import {
//   loadingHandler,
//   removeUser,
//   tokenHandler,
//   updateLoginState,
// } from 'src/redux/auth/action';
// import store from 'src/redux/store';

export default async function apiCaller({ request, errorHandler = defaultErrorHandler }) {
  try {
    const response = await request();
    return response;
  } catch (error) {
    if (error.ec === 419 || error.ec === 10019) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
    errorHandler(error);
  }
  return null;
}

function defaultErrorHandler(error) {
  console.error('An error occurred:', error);
  message.error(error);
}
