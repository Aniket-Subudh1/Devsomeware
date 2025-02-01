import { configureStore } from '@reduxjs/toolkit'
import userSlice from './features/user/userSlice'
import EventSlice from './features/events/eventSlice'
export const makeStore = () => {
  return configureStore({
    reducer: {
        user: userSlice.reducer,
        event:EventSlice.reducer
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']