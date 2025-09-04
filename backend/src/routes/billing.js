import express from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { PRICE_MAP } from '../../config/prices.js';
import { createEntitlementSafe } from '../lib/entitlementHelper.js';

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

// GET /api/billing/stripe-debug - Debug Stripe transactions and balance
router.get('/stripe-debug', async (req, res) => {
  try {
    console.log('🔍 Checking Stripe transactions and balance...');
    
    // Get current balance
    const balance = await stripe.balance.retrieve();
    console.log('Current balance:', balance);
    
    // Get recent payment intents (last 10)
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 10,
    });
    console.log('Recent payment intents:', paymentIntents.data.length);
    
    // Get recent checkout sessions (last 10)
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
    });
    console.log('Recent checkout sessions:', sessions.data.length);
    
    // Get recent customers
    const customers = await stripe.customers.list({
      limit: 5,
    });
    console.log('Recent customers:', customers.data.length);
    
    res.json({
      balance: balance,
      paymentIntents: paymentIntents.data.map(pi => ({
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        created: new Date(pi.created * 1000).toISOString()
      })),
      checkoutSessions: sessions.data.map(session => ({
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        status: session.status,
        created: new Date(session.created * 1000).toISOString()
      })),
      customers: customers.data.map(customer => ({
        id: customer.id,
        email: customer.email,
        created: new Date(customer.created * 1000).toISOString()
      }))
    });
  } catch (error) {
    console.error('❌ Stripe debug error:', error);
    res.status(500).json({ 
      error: 'Stripe debug failed', 
      details: error.message 
    });
  }
});

// GET /api/billing/simulate-settlement - Simulate settling pending payments in test mode
router.get('/simulate-settlement', async (req, res) => {
  try {
    console.log('💰 Simulating payment settlement in test mode...');
    
    // In test mode, we can simulate settlement by checking recent payment intents
    // and manually triggering balance events
    
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 20,
    });
    
    const succeededPayments = paymentIntents.data.filter(pi => pi.status === 'succeeded');
    console.log(`Found ${succeededPayments.length} succeeded payments`);
    
    // Get balance transactions (these show actual money movement)
    const balanceTransactions = await stripe.balanceTransactions.list({
      limit: 20,
    });
    
    console.log(`Found ${balanceTransactions.data.length} balance transactions`);
    
    // Check for any recent transfers or payouts
    const transfers = await stripe.transfers.list({
      limit: 10,
    });
    
    // In test mode, we can create a test payout to simulate settlement
    // This will move money from pending to available
    try {
      const testPayout = await stripe.payouts.create({
        amount: 1000, // 10.00 BGN as a test
        currency: 'bgn',
        description: 'Test payout to simulate settlement',
      });
      console.log('✅ Created test payout:', testPayout.id);
    } catch (payoutError) {
      console.log('ℹ️  Could not create test payout (this is normal):', payoutError.message);
    }
    
    res.json({
      message: 'Settlement simulation attempted',
      succeededPayments: succeededPayments.length,
      balanceTransactions: balanceTransactions.data.length,
      transfers: transfers.data.length,
      note: 'In test mode, gross income updates when payments are actually settled. You may need to manually trigger settlement in Stripe dashboard or wait for automatic processing.'
    });
  } catch (error) {
    console.error('❌ Settlement simulation error:', error);
    res.status(500).json({ 
      error: 'Settlement simulation failed', 
      details: error.message 
    });
  }
});

// GET /api/billing/income-analysis - Analyze income data for troubleshooting
router.get('/income-analysis', async (req, res) => {
  try {
    console.log('📊 Analyzing income data...');
    
    // Get balance transactions (actual money movement)
    const balanceTransactions = await stripe.balanceTransactions.list({
      limit: 50,
      type: 'charge', // Only look at actual charges
    });
    
    // Calculate total gross income from balance transactions
    const grossIncomeFromTransactions = balanceTransactions.data.reduce((total, txn) => {
      if (txn.type === 'charge' && txn.status === 'available') {
        return total + txn.amount;
      }
      return total;
    }, 0);
    
    // Get all charges (payments)
    const charges = await stripe.charges.list({
      limit: 50,
    });
    
    const successfulCharges = charges.data.filter(charge => charge.status === 'succeeded');
    const totalFromCharges = successfulCharges.reduce((total, charge) => total + charge.amount, 0);
    
    // Get reporting data (if available in test mode)
    let reportingData = null;
    try {
      // This might not work in test mode, but worth trying
      const reportRun = await stripe.reporting.reportRuns.create({
        report_type: 'balance.summary.1',
        parameters: {
          interval_start: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 days ago
          interval_end: Math.floor(Date.now() / 1000),
        },
      });
      reportingData = reportRun;
    } catch (reportError) {
      console.log('ℹ️  Reporting API not available in test mode');
    }
    
    res.json({
      analysis: {
        balanceTransactionCount: balanceTransactions.data.length,
        grossIncomeFromAvailableTransactions: grossIncomeFromTransactions,
        successfulChargesCount: successfulCharges.length,
        totalFromSuccessfulCharges: totalFromCharges,
        reportingAvailable: !!reportingData,
      },
      balanceTransactions: balanceTransactions.data.map(txn => ({
        id: txn.id,
        type: txn.type,
        amount: txn.amount,
        currency: txn.currency,
        status: txn.status,
        available_on: new Date(txn.available_on * 1000).toISOString(),
        created: new Date(txn.created * 1000).toISOString(),
      })),
      successfulCharges: successfulCharges.map(charge => ({
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        created: new Date(charge.created * 1000).toISOString(),
      })),
      explanation: {
        note: "Gross income typically comes from 'available' balance transactions, not just successful payments",
        pendingExplanation: "Your pending balance suggests payments are recorded but not yet settled for gross income calculation",
        solution: "In Stripe dashboard, look for manual settlement options or wait for automatic processing"
      }
    });
  } catch (error) {
    console.error('❌ Income analysis error:', error);
    res.status(500).json({ 
      error: 'Income analysis failed', 
      details: error.message 
    });
  }
});

// GET /api/billing/test-webhook-processing - Test webhook processing with real data
router.get('/test-webhook-processing', async (req, res) => {
  try {
    console.log('🧪 Testing webhook processing with real data...');
    
    // Find admin user
    const user = await User.findOne({ email: 'admin@gmail.com' });
    if (!user) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    console.log('✅ Found user:', user.email, user._id);
    
    // Find or create a test cart
    let cart = await Cart.findOne({ userId: user._id, status: 'open' })
      .populate('items.productId');
    
    if (!cart) {
      // Create a test cart
      const Product = (await import('../models/Product.js')).default;
      const products = await Product.find().limit(2);
      
      if (products.length === 0) {
        return res.status(404).json({ error: 'No products found' });
      }
      
      cart = new Cart({
        userId: user._id,
        status: 'open',
        items: products.map(product => ({
          productId: product._id,
          quantity: 1
        }))
      });
      
      await cart.save();
      await cart.populate('items.productId');
      console.log('✅ Created test cart:', cart._id);
    }
    
    console.log('🛒 Using cart:', cart._id, 'with', cart.items.length, 'items');
    cart.items.forEach(item => {
      console.log('  - Product:', item.productId.slug);
    });
    
    // Simulate the webhook payload that would be sent after a real payment
    const testWebhookData = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_' + Date.now(),
          mode: 'payment',
          customer: user.stripeCustomerId || 'cus_test_customer',
          payment_status: 'paid',
          status: 'complete',
          metadata: {
            userId: user._id.toString(),
            cartId: cart._id.toString(),
            type: 'cart_checkout'
          }
        }
      }
    };
    
    console.log('📦 Test webhook metadata:', testWebhookData.data.object.metadata);
    
    // Import and call the webhook processing logic directly
    const { default: Entitlement } = await import('../models/Entitlement.js');
    
    // Process the webhook (similar to the webhook handler logic)
    const session = testWebhookData.data.object;
    
    if (session.mode === 'payment' && session.metadata?.type === 'cart_checkout') {
      const userId = session.metadata.userId;
      const cartId = session.metadata.cartId;
      
      console.log('🔍 Processing cart checkout for user:', userId, 'cart:', cartId);
      
      // Find the user and cart (already have them)
      console.log('🔍 Found user', user.email, 'and cart', cart._id, 'with', cart.items.length, 'items');
      
      // Create entitlements for each purchased item
      let entitlementsCreated = 0;
      for (const cartItem of cart.items) {
        const product = cartItem.productId;
        console.log('🔍 Processing cart item', product.slug, 'x', cartItem.quantity);
        
        // Check if entitlement already exists
        const existingEntitlement = await Entitlement.findOne({
          userId: user._id,
          productSlug: product.slug,
        });
        
        if (!existingEntitlement) {
          const newEnt = await Entitlement.create({
            userId: user._id,
            productId: product._id,
            productSlug: product.slug,
            status: 'active',
            metadata: {
              stripeSessionId: session.id,
              purchaseDate: new Date(),
              pricePaid: product.priceCents * cartItem.quantity,
            },
          });
          console.log('✅ Created entitlement', newEnt._id, 'for', user.email, 'product', product.slug);
          entitlementsCreated++;
        } else {
          console.log('ℹ️ Entitlement already exists for', user.email, 'product', product.slug);
        }
      }
      
      // Mark cart as completed
      cart.status = 'ordered';
      await cart.save();
      
      res.json({
        success: true,
        message: 'Webhook processing test completed',
        user: { email: user.email, id: user._id },
        cart: { id: cart._id, itemCount: cart.items.length },
        entitlementsCreated,
        webhookData: testWebhookData
      });
    } else {
      res.json({
        success: false,
        message: 'Webhook would not be processed - conditions not met',
        session: { mode: session.mode, metadata: session.metadata }
      });
    }
    
  } catch (error) {
    console.error('❌ Webhook processing test error:', error);
    res.status(500).json({ 
      error: 'Webhook processing test failed', 
      details: error.message 
    });
  }
});

// GET /api/billing/clear-test-entitlements - Clear test entitlements for testing
router.get('/clear-test-entitlements', async (req, res) => {
  try {
    console.log('🧹 Clearing test entitlements...');
    
    const { default: Entitlement } = await import('../models/Entitlement.js');
    const user = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!user) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    // Remove all entitlements for this user
    const result = await Entitlement.deleteMany({ userId: user._id });
    console.log('🗑️ Deleted', result.deletedCount, 'entitlements for', user.email);
    
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} entitlements for ${user.email}`,
      user: { email: user.email, id: user._id }
    });
    
  } catch (error) {
    console.error('❌ Clear entitlements error:', error);
    res.status(500).json({ 
      error: 'Failed to clear entitlements', 
      details: error.message 
    });
  }
});

// GET /api/billing/check-entitlements - Check current entitlements
router.get('/check-entitlements', async (req, res) => {
  try {
    const { default: Entitlement } = await import('../models/Entitlement.js');
    const user = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!user) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    const entitlements = await Entitlement.find({ userId: user._id });
    
    res.json({
      success: true,
      user: { email: user.email, id: user._id },
      entitlements: entitlements.map(ent => ({
        id: ent._id,
        productSlug: ent.productSlug,
        status: ent.status,
        createdAt: ent.createdAt
      })),
      count: entitlements.length
    });
    
  } catch (error) {
    console.error('❌ Check entitlements error:', error);
    res.status(500).json({ 
      error: 'Failed to check entitlements', 
      details: error.message 
    });
  }
});

// GET /api/billing/get-session-metadata/:sessionId - Get metadata from a specific checkout session
router.get('/get-session-metadata/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('🔍 Retrieving session metadata for:', sessionId);
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('📦 Session details:', {
      id: session.id,
      mode: session.mode,
      status: session.status,
      payment_status: session.payment_status,
      metadata: session.metadata
    });
    
    res.json({
      success: true,
      session: {
        id: session.id,
        mode: session.mode,
        status: session.status,
        payment_status: session.payment_status,
        customer: session.customer,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
        created: new Date(session.created * 1000).toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error retrieving session metadata:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve session metadata', 
      details: error.message 
    });
  }
});

// GET /api/billing/process-completed-checkouts - Process completed checkout sessions and create entitlements
router.get('/process-completed-checkouts', async (req, res) => {
  try {
    console.log('🔄 Processing completed checkout sessions...');
    
    // Get recent completed checkout sessions from Stripe
    const sessions = await stripe.checkout.sessions.list({
      limit: 20,
      status: 'complete'
    });
    
    console.log(`🔍 Found ${sessions.data.length} completed sessions`);
    
    const { default: Entitlement } = await import('../models/Entitlement.js');
    let processedSessions = 0;
    let entitlementsCreated = 0;
    const results = [];
    
    for (const session of sessions.data) {
      // Only process cart checkouts
      if (session.mode === 'payment' && session.metadata?.type === 'cart_checkout') {
        console.log(`🔍 Processing cart checkout session: ${session.id}`);
        
        const userId = session.metadata.userId;
        const cartId = session.metadata.cartId;
        
        if (!userId || !cartId) {
          console.log(`⚠️ Skipping session ${session.id} - missing userId or cartId`);
          continue;
        }
        
        try {
          // Find the user and cart
          const user = await User.findById(userId);
          const cart = await Cart.findById(cartId).populate('items.productId');
          
          if (!user || !cart) {
            console.log(`⚠️ Skipping session ${session.id} - user or cart not found`);
            continue;
          }
          
          console.log(`🔍 Processing session ${session.id} for user ${user.email} with cart ${cart._id}`);
          
          let sessionEntitlementsCreated = 0;
          
          // Create entitlements for each cart item
          for (const cartItem of cart.items) {
            const product = cartItem.productId;
            
            // Check if entitlement already exists
            const existingEntitlement = await Entitlement.findOne({
              userId: user._id,
              productSlug: product.slug,
            });
            
            if (!existingEntitlement) {
              const newEnt = await Entitlement.create({
                userId: user._id,
                productId: product._id,
                productSlug: product.slug,
                status: 'active',
                metadata: {
                  stripeSessionId: session.id,
                  purchaseDate: new Date(session.created * 1000),
                  pricePaid: product.priceCents * cartItem.quantity,
                  processedAt: new Date(),
                  source: 'manual_processing'
                },
              });
              console.log(`✅ Created entitlement ${newEnt._id} for ${user.email} product ${product.slug}`);
              sessionEntitlementsCreated++;
              entitlementsCreated++;
            } else {
              console.log(`ℹ️ Entitlement already exists for ${user.email} product ${product.slug}`);
            }
          }
          
          // Mark cart as ordered if entitlements were created
          if (sessionEntitlementsCreated > 0 && cart.status === 'open') {
            cart.status = 'ordered';
            await cart.save();
            console.log(`✅ Marked cart ${cart._id} as ordered`);
          }
          
          results.push({
            sessionId: session.id,
            userId: user._id,
            userEmail: user.email,
            cartId: cart._id,
            entitlementsCreated: sessionEntitlementsCreated,
            cartItems: cart.items.length
          });
          
          processedSessions++;
          
        } catch (error) {
          console.error(`❌ Error processing session ${session.id}:`, error);
          results.push({
            sessionId: session.id,
            error: error.message
          });
        }
      }
    }
    
    console.log(`✅ Processed ${processedSessions} sessions, created ${entitlementsCreated} entitlements`);
    
    res.json({
      success: true,
      message: `Processed ${processedSessions} completed checkout sessions`,
      totalSessions: sessions.data.length,
      processedSessions,
      entitlementsCreated,
      results
    });
    
  } catch (error) {
    console.error('❌ Error processing completed checkouts:', error);
    res.status(500).json({ 
      error: 'Failed to process completed checkouts', 
      details: error.message 
    });
  }
});

// POST /api/billing/sync-user-entitlements - Sync entitlements for a specific user based on completed checkouts
router.post('/sync-user-entitlements', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.body; // Optional: sync only specific session
    console.log('🔄 Syncing entitlements for user:', req.user._id, sessionId ? `for session ${sessionId}` : 'for all sessions');
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.stripeCustomerId) {
      return res.json({
        success: true,
        message: 'User has no Stripe customer ID, no entitlements to sync',
        entitlementsCreated: 0
      });
    }
    
    let sessions;
    
    if (sessionId) {
      // Process only the specific session
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.customer === user.stripeCustomerId && session.status === 'complete') {
          sessions = { data: [session] };
          console.log(`🔍 Found specific session ${sessionId} for customer ${user.stripeCustomerId}`);
        } else {
          console.log(`⚠️ Session ${sessionId} doesn't belong to user or isn't complete`);
          sessions = { data: [] };
        }
      } catch (error) {
        console.error(`❌ Error retrieving session ${sessionId}:`, error);
        sessions = { data: [] };
      }
    } else {
      // Get all completed checkout sessions for this customer
      sessions = await stripe.checkout.sessions.list({
        customer: user.stripeCustomerId,
        status: 'complete',
        limit: 50
      });
      console.log(`🔍 Found ${sessions.data.length} completed sessions for customer ${user.stripeCustomerId}`);
    }
    
    const { default: Entitlement } = await import('../models/Entitlement.js');
    let entitlementsCreated = 0;
    const results = [];
    
    for (const session of sessions.data) {
      // Only process cart checkouts
      if (session.mode === 'payment' && session.metadata?.type === 'cart_checkout') {
        const cartId = session.metadata.cartId;
        
        if (!cartId) {
          console.log(`⚠️ Skipping session ${session.id} - missing cartId`);
          continue;
        }
        
        try {
          // Find the cart
          const cart = await Cart.findById(cartId).populate('items.productId');
          
          if (!cart) {
            console.log(`⚠️ Skipping session ${session.id} - cart not found`);
            continue;
          }
          
          console.log(`🔍 Processing session ${session.id} with cart ${cart._id}`);
          
          let sessionEntitlementsCreated = 0;
          
          // Create entitlements for each cart item (max 1 per product type)
          for (const cartItem of cart.items) {
            const product = cartItem.productId;
            
            // Use safe entitlement creation to prevent duplicates
            const result = await createEntitlementSafe({
              userId: user._id,
              productId: product._id,
              productSlug: product.slug,
              metadata: {
                stripeSessionId: session.id,
                purchaseDate: new Date(session.created * 1000),
                pricePaid: product.priceCents * cartItem.quantity,
                syncedAt: new Date(),
                source: sessionId ? 'payment_success' : 'user_sync',
                cartItemQuantity: cartItem.quantity
              }
            });
            
            if (result.success && result.created) {
              console.log(`✅ Created entitlement ${result.entitlement._id} for product ${product.slug}`);
              sessionEntitlementsCreated++;
              entitlementsCreated++;
            } else if (result.success && !result.created) {
              console.log(`ℹ️ Entitlement already exists for product ${product.slug} - prevented duplicate`);
            } else {
              console.error(`❌ Failed to create entitlement for product ${product.slug}:`, result.error);
            }
          }
          
          results.push({
            sessionId: session.id,
            cartId: cart._id,
            entitlementsCreated: sessionEntitlementsCreated,
            cartItems: cart.items.length
          });
          
        } catch (error) {
          console.error(`❌ Error processing session ${session.id}:`, error);
          results.push({
            sessionId: session.id,
            error: error.message
          });
        }
      }
    }
    
    // Get current entitlements
    const currentEntitlements = await Entitlement.find({ userId: user._id });
    
    console.log(`✅ Sync complete: ${entitlementsCreated} new entitlements created`);
    
    res.json({
      success: true,
      message: `Synced entitlements for ${user.email}`,
      user: { email: user.email, id: user._id },
      totalSessions: sessions.data.length,
      entitlementsCreated,
      currentEntitlements: currentEntitlements.length,
      entitlements: currentEntitlements.map(ent => ({
        productSlug: ent.productSlug,
        status: ent.status,
        createdAt: ent.createdAt
      })),
      results
    });
    
  } catch (error) {
    console.error('❌ Error syncing user entitlements:', error);
    res.status(500).json({ 
      error: 'Failed to sync user entitlements', 
      details: error.message 
    });
  }
});

export default router;
