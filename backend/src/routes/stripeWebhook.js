import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Entitlement from '../models/Entitlement.js';
import { PRICE_MAP } from '../../config/prices.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create reverse mapping from price IDs to plan names
const PRICE_TO_PLAN = Object.fromEntries(
  Object.entries(PRICE_MAP).map(([plan, priceId]) => [priceId, plan])
);

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
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

          try {
            // Find the user and cart
            const user = await User.findById(userId);
            const cart = await Cart.findById(cartId).populate('items.productId');

            if (user && cart) {
              console.log('🔍 Webhook: Found user', user.email, 'and cart', cart._id, 'with', cart.items.length, 'items');
              // Create entitlements for each purchased item
              for (const cartItem of cart.items) {
                const product = cartItem.productId;
                console.log('🔍 Webhook: Processing cart item', product.slug, 'x', cartItem.quantity);
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
                  console.log('✅ Webhook: Created entitlement', newEnt._id, 'for', user.email, 'product', product.slug);
                } else {
                  console.log('ℹ️ Webhook: Entitlement already exists for', user.email, 'product', product.slug);
                }
              }
              // Mark cart as completed
              cart.status = 'completed';
              await cart.save();
              console.log(`✅ Cart checkout completed for user ${user.email}, ${cart.items.length} items purchased`);
            } else {
              console.error('❌ User or cart not found for cart checkout:', { userId, cartId });
            }
          } catch (error) {
            console.error('❌ Error processing cart checkout:', error);
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
