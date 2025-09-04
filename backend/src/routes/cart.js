import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

// Helper function to format cart for response
const formatCartResponse = async (cart) => {
  if (!cart || !cart.items.length) {
    return {
      _id: cart?._id,
      items: [],
      subtotalCents: 0,
      itemCount: 0,
    };
  }

  // Populate product details for each item
  const populatedItems = [];
  let subtotalCents = 0;
  let itemCount = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (product && product.active) {
      const lineTotal = product.priceCents * item.quantity;
      populatedItems.push({
        _id: item._id,
        productId: product._id,
        name: product.name,
        slug: product.slug,
        priceCents: product.priceCents,
        quantity: item.quantity,
        lineTotal,
        addedAt: item.addedAt,
      });
      subtotalCents += lineTotal;
      itemCount += 1; // Count each package as 1 item, regardless of quantity
    }
  }

  return {
    _id: cart._id,
    items: populatedItems,
    subtotalCents,
    itemCount,
    updatedAt: cart.updatedAt,
  };
};

// GET /api/cart - Get current user's open cart
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id, status: 'open' });
    
    // Create empty cart if none exists
    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        status: 'open',
        items: [],
      });
      await cart.save();
    }

    const formattedCart = await formatCartResponse(cart);
    res.json(formattedCart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/cart/items - Add item to cart
router.post('/items', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Verify product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.active) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already owns this package type (max 1 per type)
    const Entitlement = (await import('../models/Entitlement.js')).default;
    const existingEntitlement = await Entitlement.findOne({
      userId: req.user._id,
      productSlug: product.slug,
      status: 'active'
    });

    if (existingEntitlement) {
      return res.status(400).json({ 
        message: `You already own the ${product.name} package. Each package type can only be purchased once.` 
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId: req.user._id, status: 'open' });
    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        status: 'open',
        items: [],
      });
    }

    // Check if product already in cart (for one-time purchases, don't allow duplicates)
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // For one-time purchases, don't add duplicates - just return current cart
      return res.status(400).json({ message: 'This package is already in your cart' });
    } else {
      // Add new item (always quantity 1 for one-time purchases)
      cart.items.push({
        productId,
        quantity: 1,
        addedAt: new Date(),
      });
    }

    await cart.save();
    const formattedCart = await formatCartResponse(cart);
    res.json(formattedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/cart/items/:itemId - Update item quantity
router.patch('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const cart = await Cart.findOne({ userId: req.user._id, status: 'open' });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = parseInt(quantity);
    }

    await cart.save();
    const formattedCart = await formatCartResponse(cart);
    res.json(formattedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/cart/items/:itemId - Remove item from cart
router.delete('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id, status: 'open' });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    const formattedCart = await formatCartResponse(cart);
    res.json(formattedCart);
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/cart/clear - Clear all items from cart
router.post('/clear', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id, status: 'open' });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    const formattedCart = await formatCartResponse(cart);
    res.json(formattedCart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
