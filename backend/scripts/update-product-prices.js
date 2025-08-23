#!/usr/bin/env node

import mongoose from 'mongoose';
import 'dotenv/config';
import Product from '../src/models/Product.js';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

// Test prices in stotinki (BGN cents) - very low for testing
const TEST_PRICES = {
  starter: 0,     // Free
  pro: 20,        // 0.20 BGN (≈ 0.10 EUR)
  elite: 40       // 0.40 BGN (≈ 0.20 EUR)
};

// Original prices in stotinki (BGN cents)
const ORIGINAL_PRICES = {
  starter: 0,     // Free
  pro: 990,       // 9.90 BGN
  elite: 2990     // 29.90 BGN
};

async function updateProductPrices(useTestPrices = true) {
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

    const prices = useTestPrices ? TEST_PRICES : ORIGINAL_PRICES;
    const mode = useTestPrices ? 'TEST' : 'ORIGINAL';
    
    console.log(`🔄 Updating products to ${mode} prices...`);

    for (const [slug, priceCents] of Object.entries(prices)) {
      const result = await Product.findOneAndUpdate(
        { slug },
        { priceCents },
        { new: true }
      );

      if (result) {
        const priceDisplay = (priceCents / 100).toFixed(2);
        console.log(`✅ Updated ${slug}: ${priceDisplay} BGN`);
      } else {
        console.log(`⚠️  Product ${slug} not found`);
      }
    }

    console.log(`✅ All products updated to ${mode} prices!`);
    
    if (useTestPrices) {
      console.log('');
      console.log('💡 Test prices active:');
      console.log('   • Pro package: 0.20 BGN (≈ 0.10 EUR)');
      console.log('   • Elite package: 0.40 BGN (≈ 0.20 EUR)');
      console.log('');
      console.log('⚠️  Remember to restore original prices after testing!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || !['test', 'original'].includes(command)) {
    console.log('📋 Product Price Updater');
    console.log('Usage: node update-product-prices.js [test|original]');
    console.log('');
    console.log('Commands:');
    console.log('  test      # Set very low prices for live testing');
    console.log('  original  # Restore original prices');
    console.log('');
    console.log('Test prices:');
    console.log('  • Starter: Free');
    console.log('  • Pro: 0.20 BGN (≈ 0.10 EUR)');
    console.log('  • Elite: 0.40 BGN (≈ 0.20 EUR)');
    
    return;
  }
  
  const useTestPrices = command === 'test';
  updateProductPrices(useTestPrices);
}

main();
