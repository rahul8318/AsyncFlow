import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initSocket } from './services/socket.js';
import { prisma } from './services/prisma.js';

const app = createApp();
const server = http.createServer(app);

// Initialize real-time Socket.IO
initSocket(server);

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AsyncFlow Enterprise Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`📡 Socket.IO Real-Time Engine Active`);
  console.log(`📊 Health Endpoint: http://localhost:${PORT}/health`);
  console.log(`======================================================\n`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('✅ PostgreSQL connection pool disconnected.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
