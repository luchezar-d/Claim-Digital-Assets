#!/usr/bin/env node

import './test-db.mjs';
import connectDB from './src/lib/db.js';
import User from './src/models/User.js';
import Entitlement from './src/models/Entitlement.js';

console.log('🔍 Checking current entitlements...');

async function checkEntitlements() {
  await connectDB();
  
  const user = await User.findOne({ email: 'admin@gmail.com' });
  if (!user) {
    console.log('❌ Admin user not found');
    return;
  }
  
  console.log('✅ Found user:', user.email);
  
  const entitlements = await Entitlement.find({ userId: user._id });
  console.log('📦 Current entitlements:', entitlements.length);
  
  entitlements.forEach(ent => {
    console.log('  - Product:', ent.productSlug, 'Status:', ent.status, 'Created:', ent.createdAt);
  });
  
  if (entitlements.length === 0) {
    console.log('✅ No entitlements - ready for testing!');
  }
}

await checkEntitlements();
process.exit(0);
