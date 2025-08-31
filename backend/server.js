
// Use dotenv in dev, Render env in prod
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
}

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { connectMongo } from './src/lib/db.js';
import authRoutes from './src/routes/auth.js';
import healthRoute from './src/routes/health.js';
import productsRouter from './src/routes/products.js';
import cartRouter from './src/routes/cart.js';
import meRouter from './src/routes/me.js';
import billingRouter from './src/routes/billing.js';
import stripeWebhookRouter from './src/routes/stripeWebhook.js';
import { notFound, errorHandler } from './src/middleware/error.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Stripe webhook route (MUST be before express.json middleware)
app.use('/api/billing/webhook', stripeWebhookRouter);

// CORS setup (single import, single use)
const allowOrigin = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5173';
app.use(cors({
  origin: allowOrigin, credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/me', meRouter);
app.use('/api/billing', billingRouter);
app.use('/api', healthRoute);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Health endpoint
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// Serve SPA static and fallback
const clientPath = path.join(__dirname, 'public');
app.use(express.static(clientPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// ...existing code for graceful shutdown and server start...

// ...existing code above (single set of imports, app, PORT, allowOrigin, and all middleware/routes)...

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
