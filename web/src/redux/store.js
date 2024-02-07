import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { userReducer } from './reducer/userReducer';
import { bookingReducer } from './reducer/bookingReducer';
import { authReducer } from './reducer/authReducer';

const rootReducer = combineReducers({
  user: userReducer,
  booking: bookingReducer,
  auth: authReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
