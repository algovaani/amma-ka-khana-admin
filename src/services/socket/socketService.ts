import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../../constants';

let socket: Socket | null = null;

export const connectAdminSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
  });

  return socket;
};

export const disconnectAdminSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const onAdminNotification = (callback: (data: unknown) => void) => {
  socket?.on('notification:new', callback);
  return () => socket?.off('notification:new', callback);
};
