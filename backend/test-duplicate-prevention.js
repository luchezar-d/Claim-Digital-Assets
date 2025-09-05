import 'dotenv/config';
import mongoose from 'mongoose';
import { createEntitlementSafe } from './src/lib/entitlementHelper.js';
import User from './src/models/User.js';
import Product from './src/models/Product.js';

async function testDuplicatePrevention() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user and test products
    const user = await User.findOne({ email: 'admin@gmail.com' });
    const starterProduct = await Product.findOne({ slug: 'starter' });
    const eliteProduct = await Product.findOne({ slug: 'elite' });

    if (!user || !starterProduct || !eliteProduct) {
      throw new Error('Test data not found');
    }

    console.log(`🧪 Testing duplicate prevention for user ${user.email}`);
    console.log(`📦 Testing with products: ${starterProduct.slug}, ${eliteProduct.slug}`);

    // Simulate concurrent entitlement creation attempts (like what happened in your case)
    console.log('\n🚀 Simulating concurrent entitlement creation...');
    
    const promises = [];
    
    // Simulate webhook handler attempting to create starter
    promises.push(createEntitlementSafe({
      userId: user._id,
      productId: starterProduct._id,
      productSlug: starterProduct.slug,
      metadata: { source: 'webhook_simulation', attempt: 1 }
    }));
    
    // Simulate CartSuccess page attempting to create starter (race condition)
    promises.push(createEntitlementSafe({
      userId: user._id,
      productId: starterProduct._id,
      productSlug: starterProduct.slug,
      metadata: { source: 'cart_success_simulation', attempt: 2 }
    }));
    
    // Simulate dashboard auto-sync attempting to create starter (race condition)
    promises.push(createEntitlementSafe({
      userId: user._id,
      productId: starterProduct._id,
      productSlug: starterProduct.slug,
      metadata: { source: 'dashboard_sync_simulation', attempt: 3 }
    }));

    // Same for elite product
    promises.push(createEntitlementSafe({
      userId: user._id,
      productId: eliteProduct._id,
      productSlug: eliteProduct.slug,
      metadata: { source: 'webhook_simulation', attempt: 1 }
    }));
    
    promises.push(createEntitlementSafe({
      userId: user._id,
      productId: eliteProduct._id,
      productSlug: eliteProduct.slug,
      metadata: { source: 'cart_success_simulation', attempt: 2 }
    }));

    // Execute all attempts concurrently (simulating race condition)
    const results = await Promise.all(promises);
    
    console.log('\n📊 Results:');
    results.forEach((result, index) => {
      const productSlug = index < 3 ? 'starter' : 'elite';
      const attempt = (index % 3) + 1;
      console.log(`${result.created ? '✅ CREATED' : 'ℹ️ PREVENTED'}: ${productSlug} attempt ${attempt} - ${result.message}`);
    });
    
    // Verify final state
    console.log('\n🔍 Final verification:');
    const Entitlement = (await import('./src/models/Entitlement.js')).default;
    const finalEntitlements = await Entitlement.find({
      userId: user._id,
      $or: [{ productSlug: 'starter' }, { productSlug: 'elite' }]
    });

    console.log(`📦 Total entitlements for starter: ${finalEntitlements.filter(e => e.productSlug === 'starter').length}`);
    console.log(`📦 Total entitlements for elite: ${finalEntitlements.filter(e => e.productSlug === 'elite').length}`);
    
    const starterCount = finalEntitlements.filter(e => e.productSlug === 'starter').length;
    const eliteCount = finalEntitlements.filter(e => e.productSlug === 'elite').length;
    
    if (starterCount === 1 && eliteCount === 1) {
      console.log('✅ SUCCESS: Duplicate prevention working correctly!');
    } else {
      console.log('❌ FAILURE: Duplicates still being created!');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testDuplicatePrevention();
