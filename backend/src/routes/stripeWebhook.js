import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Entitlement from '../models/Entitlement.js';
import { PRICE_MAP } from '../../config/prices.js';
import { createEntitlementSafe } from '../lib/entitlementHelper.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create reverse mapping from price IDs to plan names
const PRICE_TO_PLAN = Object.fromEntries(
  Object.entries(PRICE_MAP).map(([plan, priceId]) => [priceId, plan])
);

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  console.log('🚨🚨 WEBHOOK RECEIVED 🚨🚨🚨:', {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    hasSignature: !!sig,
    bodySize: req.body?.length,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'MISSING'
  });

  // Log raw body for debugging (only in development)
  if (process.env.NODE_ENV !== 'production') {
    console.log('📋 Raw webhook body (first 500 chars):', req.body.toString().substring(0, 500));
  }

  // Enable signature verification for production, allow bypass for local development
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldVerifySignature = isProduction || process.env.VERIFY_WEBHOOK_SIGNATURE === 'true';

  if (shouldVerifySignature) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      console.log('✅ Webhook signature verified, event type:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // Development mode - parse without verification
    try {
      event = JSON.parse(req.body.toString());
      console.log('⚠️ Webhook parsed WITHOUT signature verification (dev mode), event type:', event.type);
    } catch (err) {
      console.error('❌ Failed to parse webhook body:', err.message);
      return res.status(400).send('Invalid JSON');
    }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('🔍 Processing checkout.session.completed:', {
          sessionId: session.id,
          mode: session.mode,
          customer: session.customer,
          metadata: session.metadata,
          payment_status: session.payment_status,
          status: session.status
        });
        
        if (session.mode === 'subscription') {
          // Handle subscription checkout
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const priceId = subscription.items.data[0].price.id;
          const plan = PRICE_TO_PLAN[priceId];

          if (plan) {
            let user = await User.findOne({ stripeCustomerId: session.customer });
            
            if (!user) {
              const customer = await stripe.customers.retrieve(session.customer);
              user = await User.findOne({ email: customer.email });
            }

            if (user) {
              user.stripeCustomerId = session.customer;
              user.plan = plan;
              user.subscriptionStatus = subscription.status;
              user.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
              await user.save();
              
              console.log(`✅ User ${user.email} subscribed to ${plan} plan`);
            } else {
              console.error('❌ User not found for checkout session:', session.customer);
            }
          }
        } else if (session.mode === 'payment' && session.metadata?.type === 'cart_checkout') {
          // Handle cart checkout completion
          const userId = session.metadata.userId;
          const cartId = session.metadata.cartId;

          console.log('🛒 Processing cart checkout:', { userId, cartId, sessionId: session.id });

          try {
            // Find the user and cart
            const user = await User.findById(userId);
            const cart = await Cart.findById(cartId).populate('items.productId');

            console.log('🔍 Database lookup results:', {
              userFound: !!user,
              userEmail: user?.email,
              cartFound: !!cart,
              cartStatus: cart?.status,
              cartItemCount: cart?.items?.length || 0
            });

            if (user && cart) {
              console.log('🔍 Webhook: Found user', user.email, 'and cart', cart._id, 'with', cart.items.length, 'items');
              
              let entitlementsCreated = 0;
              
              // Create entitlements for each purchased item using safe creation
              for (const cartItem of cart.items) {
                const product = cartItem.productId;
                
                if (!product) {
                  console.error('⚠️ Webhook: Cart item missing product data:', cartItem);
                  continue;
                }
                
                console.log('🔍 Webhook: Processing cart item', product.slug, 'x', cartItem.quantity);
                
                // Use safe entitlement creation to prevent duplicates
                const result = await createEntitlementSafe({
                  userId: user._id,
                  productId: product._id,
                  productSlug: product.slug,
                  metadata: {
                    stripeSessionId: session.id,
                    purchaseDate: new Date(),
                    pricePaid: product.priceCents * cartItem.quantity,
                    source: 'webhook',
                    cartItemQuantity: cartItem.quantity,
                    environment: process.env.NODE_ENV || 'development'
                  }
                });
                
                if (result.success) {
                  if (result.created) {
                    console.log('✅ Webhook: Created entitlement', result.entitlement._id, 'for', user.email, 'product', product.slug);
                    entitlementsCreated++;
                  } else {
                    console.log('ℹ️ Webhook: Entitlement already exists for', user.email, 'product', product.slug, '- prevented duplicate');
                  }
                } else {
                  console.error('❌ Webhook: Failed to create entitlement for', user.email, 'product', product.slug, ':', result.error);
                }
              }
              
              // Mark cart as completed
              const oldStatus = cart.status;
              cart.status = 'ordered';
              await cart.save();
              
              console.log(`✅ Cart checkout completed for user ${user.email}:`, {
                cartId: cart._id,
                itemsProcessed: cart.items.length,
                entitlementsCreated,
                cartStatusChanged: `${oldStatus} → ${cart.status}`,
                sessionId: session.id
              });
            } else {
              console.error('❌ User or cart not found for cart checkout:', { 
                userId, 
                cartId,
                userExists: !!user,
                cartExists: !!cart,
                sessionId: session.id
              });
            }
          } catch (error) {
            console.error('❌ Error processing cart checkout:', {
              error: error.message,
              stack: error.stack,
              userId,
              cartId,
              sessionId: session.id
            });
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const priceId = subscription.items.data[0]?.price?.id;
        const plan = PRICE_TO_PLAN[priceId] || 'free';

        const user = await User.findOne({ stripeCustomerId: subscription.customer });
        
        if (user) {
          user.subscriptionStatus = subscription.status;
          user.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          
          // If subscription is canceled, downgrade to free
          if (subscription.status === 'canceled') {
            user.plan = 'free';
          } else if (plan && plan !== 'free') {
            user.plan = plan;
          }
          
          await user.save();
          
          console.log(`✅ User ${user.email} subscription updated: ${subscription.status}, plan: ${user.plan}`);
        } else {
          console.error('❌ User not found for subscription update:', subscription.customer);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
