import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  seats: {},
  products: {},
  promotions: {},
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    addSeat: (state, action) => {
      if (state.seats[action.payload.type]) {
        state.seats[action.payload.type].push({
          id: action.payload._id,
          label: action.payload.label,
          x: action.payload.coordinates[0],
          y: action.payload.coordinates[1],
        });
      } else {
        state.seats[action.payload.type] = [
          {
            id: action.payload._id,
            label: action.payload.label,
            x: action.payload.coordinates[0],
            y: action.payload.coordinates[1],
          },
        ];
      }
    },
    deleteSeat: (state, action) => {
      const arr = state.seats[action.payload.type]?.filter((e) => e.id !== action.payload._id);
      if (arr?.length) {
        state.seats[action.payload.type] = arr;
      } else {
        delete state.seats[action.payload.type];
      }
    },
    addProduct: (state, action) => {
      if (state.products[action.payload._id]) {
        state.products[action.payload._id].quantity += 1;
      } else {
        state.products[action.payload._id] = {
          quantity: 1,
          name: action.payload.name,
          price: action.payload.price,
        };
      }
    },
    deleteProduct: (state, action) => {
      state.products[action.payload._id].quantity -= 1;
      if (state.products[action.payload._id].quantity <= 0) delete state.products[action.payload._id];
    },
    addPromotion: (state, action) => {
      state.promotions[action.payload._id] = {
        code: action.payload.code,
        value: action.payload.value,
        type: action.payload.type,
      };
    },
    deletePromotion: (state, action) => {
      delete state.promotions[action.payload._id];
    },
    cleanData: (state) => {
      state.seats = {};
      state.promotions = {};
      state.products = {};
    },
  },
});

export const { addSeat, deleteSeat, addProduct, deleteProduct, addPromotion, deletePromotion, cleanData } =
  bookingSlice.actions;

export const bookingReducer = bookingSlice.reducer;
