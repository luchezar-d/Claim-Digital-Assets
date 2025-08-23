import express from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { PRICE_MAP } from '../../config/prices.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's active cart
    const cart = await Cart.findOne({ userId: req.user._id, status: 'open' })
      .populate('items.productId');

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
        currency: 'bgn', // Bulgarian Lev
        product_data: {
          name: item.productId.name,
          description: item.productId.description || 'Digital bonus package',
          metadata: {
            productSlug: item.productId.slug,
          },
        },
        unit_amount: item.productId.priceCents, // Price in stotinki (BGN cents)
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
    res.status(500).json({ error: 'Failed to create checkout session' });
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
