import 'dotenv/config';
import mongoose from 'mongoose';
import Entitlement from './src/models/Entitlement.js';
import { getEntitlementCounts } from './src/lib/entitlementHelper.js';

async function cleanupDuplicateEntitlements() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with entitlements
    const userEntitlements = await Entitlement.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$userId',
          entitlements: { $push: '$$ROOT' }
        }
      }
    ]);

    console.log(`🔍 Found ${userEntitlements.length} users with entitlements`);

    let totalCleaned = 0;

    for (const userGroup of userEntitlements) {
      const userId = userGroup._id;
      const entitlements = userGroup.entitlements;

      // Group entitlements by productSlug
      const byProduct = {};
      entitlements.forEach(ent => {
        if (!byProduct[ent.productSlug]) {
          byProduct[ent.productSlug] = [];
        }
        byProduct[ent.productSlug].push(ent);
      });

      // Find duplicates (more than 1 entitlement per product)
      for (const [productSlug, ents] of Object.entries(byProduct)) {
        if (ents.length > 1) {
          console.log(`⚠️ User ${userId} has ${ents.length} entitlements for ${productSlug}`);
          
          // Sort by creation date (keep the oldest one)
          ents.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          
          // Keep the first (oldest), delete the rest
          const toDelete = ents.slice(1);
          
          for (const duplicate of toDelete) {
            await Entitlement.findByIdAndDelete(duplicate._id);
            console.log(`🗑️ Deleted duplicate entitlement ${duplicate._id} for ${productSlug}`);
            totalCleaned++;
          }
        }
      }
    }

    console.log(`✅ Cleanup complete. Removed ${totalCleaned} duplicate entitlements.`);

    // Verify cleanup by checking counts
    console.log('\n📊 Final entitlement counts:');
    const finalCounts = await Entitlement.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: { userId: '$userId', productSlug: '$productSlug' },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (finalCounts.length === 0) {
      console.log('✅ No duplicate entitlements found - cleanup successful!');
    } else {
      console.log('❌ Still found duplicates:', finalCounts);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

cleanupDuplicateEntitlements();
