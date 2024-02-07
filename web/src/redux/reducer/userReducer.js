import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: undefined,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
});

export const { setProfile } = userSlice.actions;

export const userReducer = userSlice.reducer;
