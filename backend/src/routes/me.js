import express from 'express';
import Stripe from 'stripe';
import Entitlement from '../models/Entitlement.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { requireAuth } from '../middleware/auth.js';
import { createEntitlementSafe } from '../lib/entitlementHelper.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// All me routes require authentication
router.use(requireAuth);

// GET /api/me/packages - Get user's active entitlements with product details (with auto-sync)
router.get('/packages', async (req, res) => {
  try {
    console.log('📦 Fetching packages for user:', req.user._id);
    
    // Auto-sync entitlements from completed Stripe checkout sessions
    if (req.user.stripeCustomerId) {
      try {
        console.log('🔄 Auto-syncing entitlements from Stripe...');
        
        // Get recent completed checkout sessions for this customer
        const sessions = await stripe.checkout.sessions.list({
          customer: req.user.stripeCustomerId,
          status: 'complete',
          limit: 20
        });
        
        console.log(`🔍 Found ${sessions.data.length} completed sessions for auto-sync`);
        
        let autoSyncCreated = 0;
        
        for (const session of sessions.data) {
          // Only process cart checkouts that haven't been processed
          if (session.mode === 'payment' && session.metadata?.type === 'cart_checkout') {
            const cartId = session.metadata.cartId;
            
            if (cartId) {
              try {
                const cart = await Cart.findById(cartId).populate('items.productId');
                
                if (cart) {
                  // Create entitlements for each cart item if they don't exist
                  for (const cartItem of cart.items) {
                    const product = cartItem.productId;
                    
                    // Use safe entitlement creation to prevent duplicates
                    const result = await createEntitlementSafe({
                      userId: req.user._id,
                      productId: product._id,
                      productSlug: product.slug,
                      metadata: {
                        stripeSessionId: session.id,
                        purchaseDate: new Date(session.created * 1000),
                        pricePaid: product.priceCents * cartItem.quantity,
                        autoSynced: true,
                        syncedAt: new Date(),
                        source: 'dashboard_auto_sync',
                        cartItemQuantity: cartItem.quantity
                      }
                    });
                    
                    if (result.success && result.created) {
                      autoSyncCreated++;
                      console.log(`✅ Auto-synced entitlement for product ${product.slug}`);
                    } else if (result.success && !result.created) {
                      console.log(`ℹ️ Entitlement already exists for product ${product.slug} - prevented duplicate`);
                    } else {
                      console.error(`❌ Failed to auto-sync entitlement for product ${product.slug}:`, result.error);
                    }
                  }
                  
                  // Mark cart as ordered if not already
                  if (cart.status === 'open') {
                    cart.status = 'ordered';
                    await cart.save();
                  }
                }
              } catch (syncError) {
                console.error(`⚠️ Error auto-syncing session ${session.id}:`, syncError.message);
              }
            }
          }
        }
        
        if (autoSyncCreated > 0) {
          console.log(`✅ Auto-sync created ${autoSyncCreated} new entitlements`);
        }
        
      } catch (syncError) {
        console.error('⚠️ Auto-sync failed, continuing with existing entitlements:', syncError.message);
      }
    }
    
    // Now fetch and return the user's entitlements
    const entitlements = await Entitlement.find({
      userId: req.user._id,
      status: 'active',
    }).populate('productId');

    const packages = entitlements
      .filter((entitlement) => entitlement.productId) // Filter out deleted products
      .map((entitlement) => ({
        slug: entitlement.productSlug,
        name: entitlement.productId.name,
        accessType: entitlement.accessType,
        startsAt: entitlement.startsAt,
        endsAt: entitlement.endsAt,
        features: entitlement.productId.features,
        priceCents: entitlement.productId.priceCents,
        status: entitlement.status,
      }));

    console.log(`📦 Returning ${packages.length} packages for user ${req.user.email}`);
    res.json(packages);
  } catch (error) {
    console.error('Error fetching user packages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/me - Update user profile (TODO)
router.patch('/', async (req, res) => {
  // TODO: Implement user profile updates
  res.status(501).json({ message: 'Profile updates not implemented yet' });
});

export default router;
