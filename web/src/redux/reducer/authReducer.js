import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  openLogin: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openLogin: (state, action) => {
      state.openLogin = action.payload;
    },
  },
});

export const { openLogin } = authSlice.actions;

export const authReducer = authSlice.reducer;
