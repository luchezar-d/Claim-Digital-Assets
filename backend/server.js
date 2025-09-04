import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
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
import debugRouter from './src/routes/debug.js';
import { notFound, errorHandler } from './src/middleware/error.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Stripe webhook route (MUST be before express.json middleware)
app.use('/api/billing/webhook', stripeWebhookRouter);

// CORS setup (single import, single use)
const allowOrigins = process.env.NODE_ENV === 'production'
  ? undefined
  : ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: allowOrigins, credentials: true,
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
app.use('/api/debug', debugRouter);
app.use('/api', healthRoute);

// --- Serve the built client (SPA) ---
const clientPath = path.join(__dirname, 'public');

// Check if public directory exists (production mode)
import fs from 'fs';
const publicExists = fs.existsSync(clientPath);

if (publicExists) {
  // Serve static assets
  app.use(express.static(clientPath, { index: false, maxAge: '1h' }));
  
  // Send index.html for all non-API routes (SPA fallback)
  app.get(/^\/(?!api)(.*)/, (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
} else {
  // Development mode - redirect to Vite dev server
  app.get(/^\/(?!api)(.*)/, (req, res) => {
    res.json({ 
      message: 'Development mode - Frontend served by Vite',
      frontend: 'http://localhost:5173',
      api: `http://localhost:${PORT}/api`
    });
  });
}

// Optional health check
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// Temporary test endpoint to create entitlements manually
app.get('/test-entitlements', async (req, res) => {
  try {
    const User = (await import('./src/models/User.js')).default;
    const Product = (await import('./src/models/Product.js')).default;
    const Entitlement = (await import('./src/models/Entitlement.js')).default;

    const user = await User.findOne({ email: 'admin@gmail.com' });
    if (!user) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    const products = await Product.find({});
    if (products.length === 0) {
      return res.status(404).json({ error: 'No products found' });
    }

    const results = [];
    for (let i = 0; i < Math.min(2, products.length); i++) {
      const product = products[i];
      
      const existing = await Entitlement.findOne({
        userId: user._id,
        productSlug: product.slug
      });

      if (!existing) {
        const entitlement = await Entitlement.create({
          userId: user._id,
          productId: product._id,
          productSlug: product.slug,
          status: 'active'
        });
        results.push({ action: 'created', product: product.slug, id: entitlement._id });
      } else {
        results.push({ action: 'exists', product: product.slug, id: existing._id });
      }
    }

    const allEntitlements = await Entitlement.find({ userId: user._id });
    res.json({ 
      message: 'Test entitlements processed',
      results,
      totalEntitlements: allEntitlements.length,
      entitlements: allEntitlements.map(e => ({ id: e._id, productSlug: e.productSlug }))
    });
  } catch (error) {
    console.error('Test entitlements error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling (must be after everything else)
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
      console.log(`🚀 API on http://localhost:${PORT} - with test endpoint`);
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
