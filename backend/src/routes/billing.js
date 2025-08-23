import express from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { PRICE_MAP } from '../../config/prices.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /api/billing/test - Test Stripe connection
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing Stripe connection...');
    console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('STRIPE_SECRET_KEY starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 15));
    
    // Test basic Stripe connection
    const balance = await stripe.balance.retrieve();
    console.log('✅ Stripe connection successful');
    
    res.json({ 
      success: true, 
      message: 'Stripe connection working',
      currency: balance.available[0]?.currency || 'unknown'
    });
  } catch (error) {
    console.error('❌ Stripe test error:', error);
    res.status(500).json({ 
      error: 'Stripe test failed', 
      details: error.message 
    });
  }
});

// GET /api/billing/cart-debug - Debug cart contents
router.get('/cart-debug', requireAuth, async (req, res) => {
  try {
    console.log('🛒 Debug cart for user:', req.user._id);
    
    const cart = await Cart.findOne({ userId: req.user._id, status: 'open' })
      .populate('items.productId');
    
    console.log('Cart found:', !!cart);
    console.log('Cart items:', cart?.items?.length || 0);
    
    if (cart && cart.items) {
      cart.items.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          name: item.productId?.name,
          price: item.productId?.priceCents,
          quantity: item.quantity
        });
      });
    }
    
    res.json({
      hasCart: !!cart,
      itemCount: cart?.items?.length || 0,
      items: cart?.items?.map(item => ({
        name: item.productId?.name,
        price: item.productId?.priceCents,
        quantity: item.quantity
      })) || []
    });
  } catch (error) {
    console.error('❌ Cart debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/billing/create-checkout-session
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { plan } = req.body;

    // Validate plan
    if (!plan || !PRICE_MAP[plan]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure Stripe customer exists
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });
      stripeCustomerId = customer.id;
      
      // Update user with customer ID
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: PRICE_MAP[plan],
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_BASE_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL}/billing/cancel`,
      customer_update: {
        address: 'auto', // Allow Stripe to collect and save address
      },
      automatic_tax: {
        enabled: true,
      },
      metadata: {
        userId: user._id.toString(),
        plan: plan,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/billing/create-portal-session
router.post('/create-portal-session', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'No billing account found. Please subscribe to a plan first.' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.APP_BASE_URL}/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal session creation error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// POST /api/billing/create-cart-checkout-session
router.post('/create-cart-checkout-session', requireAuth, async (req, res) => {
  try {
    console.log('🛒 Cart checkout session request from user:', req.user._id);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User found:', user.email);

    // Get user's active cart
    const cart = await Cart.findOne({ userId: req.user._id, status: 'open' })
      .populate('items.productId');

    console.log('🛒 Cart found:', cart ? `${cart.items.length} items` : 'No cart');

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Ensure Stripe customer exists
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });
      stripeCustomerId = customer.id;
      
      // Update user with customer ID
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    // Create line items for each cart item
    const lineItems = cart.items.map(item => ({
      price_data: {
        currency: 'eur', // EUR for testing (BGN not always supported in test mode)
        product_data: {
          name: item.productId.name,
          description: item.productId.description || 'Digital bonus package',
          metadata: {
            productSlug: item.productId.slug,
          },
        },
        unit_amount: item.productId.slug === 'starter' ? 0 : (item.productId.slug === 'pro' ? 100 : 200), // Test prices: Free, €1.00, €2.00 (meets BGN minimum)
      },
      quantity: item.quantity,
    }));

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // One-time payment (not subscription)
      customer: stripeCustomerId,
      line_items: lineItems,
      success_url: `${process.env.APP_BASE_URL}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL}/`,
      customer_update: {
        address: 'auto', // Allow Stripe to collect and save address
        shipping: 'auto', // Allow Stripe to collect and save shipping
      },
      automatic_tax: {
        enabled: true,
      },
      metadata: {
        userId: user._id.toString(),
        cartId: cart._id.toString(),
        type: 'cart_checkout',
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Cart checkout session creation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      stripeError: error.type || 'Unknown',
    });
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// GET /api/billing/subscription
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      plan: user.plan || 'free',
      subscriptionStatus: user.subscriptionStatus || 'incomplete',
      currentPeriodEnd: user.currentPeriodEnd,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

export default router;
