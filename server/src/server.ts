import app from './index';
import dotenv from 'dotenv';

import { PrismaClient } from '@prisma/client';
dotenv.config();

export const prisma = new PrismaClient();

const port = process.env.PORT || 5000;

async function bootstrapServer() {
  try {
    await prisma.$connect();
    console.log('🎯 Database connection established');

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('🔄 Shutting down gracefully...');
      await prisma.$disconnect();
      server.close(() => {
        console.log('💤 Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Error handlers
    process.on('uncaughtException', async (error) => {
      console.error('💥 Uncaught Exception:', error);
      await shutdown();
    });

    process.on('unhandledRejection', async (error) => {
      console.error('💥 Unhandled Rejection:', error);
      await shutdown();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrapServer();
