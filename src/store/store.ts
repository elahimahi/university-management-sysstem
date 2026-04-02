import { configureStore, createSlice } from '@reduxjs/toolkit';

// Create a simple placeholder reducer to avoid Redux warning
const placeholderSlice = createSlice({
  name: 'placeholder',
  initialState: { value: null },
  reducers: {},
});

export const store = configureStore({
  reducer: {
    placeholder: placeholderSlice.reducer,
    // Add your reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
