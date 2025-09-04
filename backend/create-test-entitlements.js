import { connectMongo } from './src/lib/db.js';
import Entitlement from './src/models/Entitlement.js';
import Product from './src/models/Product.js';
import User from './src/models/User.js';

async function createTestEntitlements() {
  try {
    await connectMongo();
    console.log('✅ MongoDB connected');

    // Get products
    const starterProduct = await Product.findOne({ slug: 'starter' });
    const proProduct = await Product.findOne({ slug: 'pro' });
    const eliteProduct = await Product.findOne({ slug: 'elite' });
    
    if (!starterProduct || !proProduct || !eliteProduct) {
      console.error('❌ Products not found');
      process.exit(1);
    }

    // Get a test user (let's use admin for testing)
    const testUser = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!testUser) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    console.log(`🔍 Creating entitlements for user: ${testUser.email}`);

    // Delete existing entitlements for this user to avoid duplicates
    await Entitlement.deleteMany({ userId: testUser._id });

    // Create entitlements
    const entitlements = [
      {
        userId: testUser._id,
        productId: starterProduct._id,
        productSlug: starterProduct.slug,
        accessType: 'one_time',
        status: 'active',
        startsAt: new Date(),
        endsAt: null, // one-time purchase
      },
      {
        userId: testUser._id,
        productId: proProduct._id,
        productSlug: proProduct.slug,
        accessType: 'subscription',
        status: 'active',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        userId: testUser._id,
        productId: eliteProduct._id,
        productSlug: eliteProduct.slug,
        accessType: 'subscription',
        status: 'active',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      }
    ];

    const createdEntitlements = await Entitlement.insertMany(entitlements);
    
    console.log('✅ Created entitlements:', createdEntitlements.length);
    console.log('📦 Packages created:');
    createdEntitlements.forEach(ent => {
      console.log(`  - ${ent.productSlug} (${ent.accessType} access)`);
    });
    
    console.log(`\n🚀 Login as ${testUser.email} to see packages on dashboard`);
    
  } catch (error) {
    console.error('❌ Error creating entitlements:', error);
  } finally {
    process.exit(0);
  }
}

createTestEntitlements();
