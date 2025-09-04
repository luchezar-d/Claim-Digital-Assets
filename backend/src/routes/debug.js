import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Entitlement from '../models/Entitlement.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Only enable debug routes in development or when explicitly enabled
const isDebugEnabled = process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEBUG_ROUTES === 'true';

if (!isDebugEnabled) {
  router.use((req, res) => {
    res.status(404).json({ error: 'Debug routes not available in production' });
  });
} else {

  // GET /api/debug/webhook-config - Check webhook configuration
  router.get('/webhook-config', async (req, res) => {
    try {
      const config = {
        environment: process.env.NODE_ENV || 'development',
        stripeKeySet: !!process.env.STRIPE_SECRET_KEY,
        stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 15),
        webhookSecretSet: !!process.env.STRIPE_WEBHOOK_SECRET,
        mongodbUriSet: !!process.env.MONGODB_URI,
        debugRoutesEnabled: isDebugEnabled
      };

      res.json({ success: true, config });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/debug/recent-sessions/:userId - Check recent Stripe sessions for a user
  router.get('/recent-sessions/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.stripeCustomerId) {
        return res.json({ sessions: [], message: 'User has no Stripe customer ID' });
      }

      const sessions = await stripe.checkout.sessions.list({
        customer: user.stripeCustomerId,
        limit: 10
      });

      const sessionData = sessions.data.map(session => ({
        id: session.id,
        status: session.status,
        mode: session.mode,
        payment_status: session.payment_status,
        created: new Date(session.created * 1000),
        metadata: session.metadata
      }));

      res.json({ 
        success: true, 
        user: { id: user._id, email: user.email },
        sessions: sessionData 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/debug/cart-status/:userId - Check user's cart status
  router.get('/cart-status/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const carts = await Cart.find({ userId }).populate('items.productId').sort({ createdAt: -1 });
      const entitlements = await Entitlement.find({ userId, status: 'active' }).populate('productId');

      res.json({ 
        success: true,
        user: { id: user._id, email: user.email },
        carts: carts.map(cart => ({
          id: cart._id,
          status: cart.status,
          itemCount: cart.items.length,
          items: cart.items.map(item => ({
            productSlug: item.productId?.slug,
            quantity: item.quantity
          })),
          createdAt: cart.createdAt,
          updatedAt: cart.updatedAt
        })),
        entitlements: entitlements.map(ent => ({
          id: ent._id,
          productSlug: ent.productSlug,
          status: ent.status,
          createdAt: ent.createdAt
        }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/debug/simulate-webhook - Simulate webhook processing for a session
  router.post('/simulate-webhook', async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId required' });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.mode !== 'payment' || session.metadata?.type !== 'cart_checkout') {
        return res.status(400).json({ error: 'Session is not a cart checkout' });
      }

      const userId = session.metadata.userId;
      const cartId = session.metadata.cartId;

      const user = await User.findById(userId);
      const cart = await Cart.findById(cartId).populate('items.productId');

      if (!user || !cart) {
        return res.status(404).json({ error: 'User or cart not found' });
      }

      // Simulate the webhook processing
      const results = [];
      for (const cartItem of cart.items) {
        const product = cartItem.productId;
        
        const { createEntitlementSafe } = await import('../lib/entitlementHelper.js');
        
        const result = await createEntitlementSafe({
          userId: user._id,
          productId: product._id,
          productSlug: product.slug,
          metadata: {
            stripeSessionId: session.id,
            purchaseDate: new Date(),
            pricePaid: product.priceCents * cartItem.quantity,
            source: 'debug_simulation',
            cartItemQuantity: cartItem.quantity
          }
        });

        results.push({
          productSlug: product.slug,
          result: result
        });
      }

      // Update cart status
      cart.status = 'ordered';
      await cart.save();

      res.json({
        success: true,
        message: 'Webhook simulation completed',
        session: {
          id: session.id,
          status: session.status,
          metadata: session.metadata
        },
        results,
        cartUpdated: true
      });

    } catch (error) {
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  });

}

export default router;
