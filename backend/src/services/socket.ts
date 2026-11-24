import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from '../config/env.js';

let ioInstance: SocketIOServer | null = null;

export const initSocket = (server: HttpServer): SocketIOServer => {
  ioInstance = new SocketIOServer(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance.on('connection', (socket: Socket) => {
    // Client joins organization and user rooms
    socket.on('join_org', (orgId: string) => {
      if (orgId) {
        socket.join(`org:${orgId}`);
      }
    });

    socket.on('join_user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return ioInstance;
};

export const getIO = (): SocketIOServer | null => ioInstance;

export const emitToUser = (userId: string, event: string, payload: any) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, payload);
  }
};

export const emitToOrg = (orgId: string, event: string, payload: any) => {
  if (ioInstance) {
    ioInstance.to(`org:${orgId}`).emit(event, payload);
  }
};
