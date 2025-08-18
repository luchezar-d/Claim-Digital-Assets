import mongoose from 'mongoose';
import 'dotenv/config';
import Product from '../src/models/Product.js';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

const seedProducts = [
  {
    slug: 'starter',
    name: 'Starter',
    description: 'Perfect for getting started with rewards optimization',
    priceCents: 0,
    features: [
      { label: 'Access to basic rewards tracking', value: true },
      { label: 'Monthly summary reports', value: true },
      { label: 'Up to 3 credit cards', value: '3 cards' },
      { label: 'Email support', value: true },
      { label: 'Basic optimization tips', value: true },
    ],
    active: true,
  },
  {
    slug: 'pro',
    name: 'Pro',
    description: 'Advanced features for serious rewards maximizers',
    priceCents: 990,
    features: [
      { label: 'Everything in Starter', value: true },
      { label: 'Real-time optimization alerts', value: true },
      { label: 'Unlimited credit cards', value: 'Unlimited' },
      { label: 'Advanced analytics dashboard', value: true },
      { label: 'Category-specific recommendations', value: true },
      { label: 'Priority email support', value: true },
      { label: 'Custom reward goals tracking', value: true },
    ],
    active: true,
  },
  {
    slug: 'elite',
    name: 'Elite',
    description: 'Premium experience with white-glove service',
    priceCents: 2990,
    features: [
      { label: 'Everything in Pro', value: true },
      { label: 'Personal rewards strategist', value: '1-on-1 calls' },
      { label: 'Custom optimization strategies', value: true },
      { label: 'Travel rewards maximization', value: true },
      { label: 'Exclusive partner offers', value: true },
      { label: 'Phone support', value: 'Priority' },
      { label: 'Quarterly strategy reviews', value: true },
      { label: 'Advanced tax optimization', value: true },
      { label: 'API access for developers', value: true },
      { label: 'Custom integrations', value: true },
    ],
    active: true,
  },
];

async function seedProductsData() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('🔗 Connecting to MongoDB...');

    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 10000,
    });

    console.log('✅ Connected to database');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const productData of seedProducts) {
      const existingProduct = await Product.findOne({ slug: productData.slug });

      if (existingProduct) {
        // Update existing product
        await Product.findOneAndUpdate(
          { slug: productData.slug },
          productData,
          { new: true }
        );
        console.log(`✓ Updated product: ${productData.name}`);
        updatedCount++;
      } else {
        // Insert new product
        const product = new Product(productData);
        await product.save();
        console.log(`✓ Inserted product: ${productData.name}`);
        insertedCount++;
      }
    }

    console.log(`✅ Seed complete! Inserted: ${insertedCount}, Updated: ${updatedCount}`);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedProductsData();
