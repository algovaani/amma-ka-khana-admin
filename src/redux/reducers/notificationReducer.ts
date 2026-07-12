import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AdminNotification {
  id?: string;
  title: string;
  body: string;
  type: string;
  category?: string;
  data?: Record<string, unknown>;
  createdAt?: string;
  isRead?: boolean;
}

interface NotificationState {
  items: AdminNotification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notificationReceived: (state, action: PayloadAction<AdminNotification>) => {
      const id = action.payload.id ?? `${Date.now()}`;
      const exists = state.items.some((item) => item.id === id);
      if (!exists) {
        state.items.unshift({ ...action.payload, id, isRead: false });
        state.unreadCount += 1;
      }
    },
    markAllRead: (state) => {
      state.items = state.items.map((item) => ({ ...item, isRead: true }));
      state.unreadCount = 0;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearNotifications: () => initialState,
  },
});

export const { notificationReceived, markAllRead, markNotificationRead, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
