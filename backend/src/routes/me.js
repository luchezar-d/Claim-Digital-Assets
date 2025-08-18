import express from 'express';
import Entitlement from '../models/Entitlement.js';
import Product from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All me routes require authentication
router.use(requireAuth);

// GET /api/me/packages - Get user's active entitlements with product details
router.get('/packages', async (req, res) => {
  try {
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
