import mongoose from 'mongoose';
import 'dotenv/config';
import Product from '../src/models/Product.js';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

async function updatePricesForLiveTest() {
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

    // Update Pro product to 10 stotinki (0.10 BGN)
    const proResult = await Product.findOneAndUpdate(
      { slug: 'pro' },
      { priceCents: 10 },
      { new: true }
    );

    // Update Elite product to 10 stotinki (0.10 BGN)  
    const eliteResult = await Product.findOneAndUpdate(
      { slug: 'elite' },
      { priceCents: 10 },
      { new: true }
    );

    if (proResult) {
      console.log(`✓ Updated Pro product price to ${proResult.priceCents} stotinki (${proResult.priceCents / 100} BGN)`);
    } else {
      console.log('❌ Pro product not found');
    }

    if (eliteResult) {
      console.log(`✓ Updated Elite product price to ${eliteResult.priceCents} stotinki (${eliteResult.priceCents / 100} BGN)`);
    } else {
      console.log('❌ Elite product not found');
    }

    console.log('✅ Live test prices updated!');
    console.log('⚠️  REMEMBER: After testing, restore original prices:');
    console.log('   Pro: 990 stotinki (9.90 BGN)');
    console.log('   Elite: 2990 stotinki (29.90 BGN)');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

updatePricesForLiveTest();
