import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authReducer from './reducers/authReducer';
import dashboardReducer from './reducers/dashboardReducer';
import notificationReducer from './reducers/notificationReducer';
import rootSaga from './saga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefault) => getDefault({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
