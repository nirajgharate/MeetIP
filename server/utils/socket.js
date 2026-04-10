import { Server } from 'socket.io';

let io = null;
export const onlineUsers = new Map();

export const initializeSocketServer = (server) => {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet.');
  }
  return io;
};
