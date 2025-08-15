import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { connectMongo } from './src/lib/db.js';
import authRoutes from './src/routes/auth.js';
import healthRoute from './src/routes/health.js';
import { notFound, errorHandler } from './src/middleware/error.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', healthRoute);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Try to connect to MongoDB, but don't fail if it's not available
    try {
      await connectMongo();
      console.log('✅ MongoDB connected successfully');
    } catch (mongoError) {
      console.warn('⚠️  MongoDB not available, running in mock mode');
      console.warn('   Install and start MongoDB to enable database features');
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 API on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      server.close(async () => {
        try {
          if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('✅ MongoDB connection closed');
          }
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
