#!/usr/bin/env node

import './test-db.mjs';
import connectDB from './src/lib/db.js';
import User from './src/models/User.js';
import Cart from './src/models/Cart.js';
import Product from './src/models/Product.js';

console.log('🛒 Creating test cart for webhook testing...');

async function createTestCart() {
  await connectDB();
  
  // Find admin user
  const user = await User.findOne({ email: 'admin@gmail.com' });
  if (!user) {
    console.log('❌ Admin user not found');
    return;
  }
  
  console.log('✅ Found user:', user.email);
  
  // Get products
  const products = await Product.find();
  console.log('📦 Found products:', products.map(p => p.slug));
  
  // Create a new cart
  const cart = new Cart({
    userId: user._id,
    status: 'open',
    items: [
      {
        productId: products[0]._id, // Add first product (starter)
        quantity: 1
      },
      {
        productId: products[1]._id, // Add second product (pro)  
        quantity: 1
      }
    ]
  });
  
  await cart.save();
  console.log('✅ Created test cart:', cart._id);
  console.log('🛒 Cart items:', cart.items.length);
  
  return { user, cart };
}

const { user, cart } = await createTestCart();

if (cart) {
  console.log('\n🧪 Now you can test webhook with:');
  console.log('User ID:', user._id.toString());
  console.log('Cart ID:', cart._id.toString());
  
  console.log('\n📋 Test webhook payload metadata should be:');
  console.log(JSON.stringify({
    userId: user._id.toString(),
    cartId: cart._id.toString(),
    type: 'cart_checkout'
  }, null, 2));
}

process.exit(0);
