import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import detectionSlice from './slices/detectionSlice'
import complianceSlice from './slices/complianceSlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    detection: detectionSlice,
    compliance: complianceSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store