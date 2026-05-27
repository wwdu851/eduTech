import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import boardReducer from './boardSlice';
import inquiryReducer from './inquirySlice';
import knowledgeReducer from './knowledgeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
    inquiry: inquiryReducer,
    knowledge: knowledgeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
