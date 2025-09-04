import { connectMongo } from './src/lib/db.js';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Entitlement from './src/models/Entitlement.js';

async function createTestEntitlements() {
  try {
    await connectMongo();
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const user = await User.findOne({ email: 'admin@gmail.com' });
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    console.log('✅ Found user:', user.email);

    // Find products
    const products = await Product.find({});
    console.log('📦 Found', products.length, 'products:', products.map(p => p.slug));

    if (products.length === 0) {
      console.log('❌ No products found');
      return;
    }

    // Create entitlements for the first 2 products
    for (let i = 0; i < Math.min(2, products.length); i++) {
      const product = products[i];
      
      // Check if entitlement already exists
      const existing = await Entitlement.findOne({
        userId: user._id,
        productSlug: product.slug
      });

      if (existing) {
        console.log('ℹ️ Entitlement already exists for:', product.slug);
      } else {
        const entitlement = await Entitlement.create({
          userId: user._id,
          productId: product._id,
          productSlug: product.slug,
          status: 'active'
        });
        console.log('✅ Created entitlement for:', product.slug, '- ID:', entitlement._id);
      }
    }

    // Check final entitlements
    const allEntitlements = await Entitlement.find({ userId: user._id });
    console.log('📦 User now has', allEntitlements.length, 'entitlements:', allEntitlements.map(e => e.productSlug));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestEntitlements();
