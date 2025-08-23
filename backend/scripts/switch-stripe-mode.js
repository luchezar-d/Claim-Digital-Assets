#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');

// Function to load environment variables from .env file
function loadEnvVars() {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Error loading .env file:', error.message);
    return {};
  }
}

// Load Stripe keys from environment
function getStripeKeys() {
  const envVars = loadEnvVars();
  
  return {
    test: {
      secret: envVars.STRIPE_TEST_SECRET_KEY,
      publishable: envVars.STRIPE_TEST_PUBLISHABLE_KEY,
      webhook: 'whsec_your_test_webhook_secret_here' // This gets updated via Stripe CLI
    },
    live: {
      secret: envVars.STRIPE_LIVE_SECRET_KEY,
      publishable: envVars.STRIPE_LIVE_PUBLISHABLE_KEY,
      webhook: 'whsec_your_live_webhook_secret_here' // This gets updated via Stripe CLI
    }
  };
}

// Clear customer IDs from database when switching modes
async function clearStripeCustomerIds(targetMode) {
  const envVars = loadEnvVars();
  const mongoUri = envVars.MONGODB_URI;
  const dbName = envVars.DB_NAME;

  if (!mongoUri || !dbName) {
    console.warn('⚠️  MongoDB connection not configured, skipping customer ID cleanup');
    return true;
  }

  let client;
  try {
    console.log(`🗑️  Clearing ${targetMode === 'test' ? 'live' : 'test'} Stripe customer IDs from database...`);
    
    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    
    // Clear all Stripe customer IDs since they won't work in the new environment
    const result = await db.collection('users').updateMany(
      { stripeCustomerId: { $exists: true, $ne: null } },
      { $unset: { stripeCustomerId: "" } }
    );
    
    console.log(`✅ Cleared customer IDs from ${result.modifiedCount} users`);
    return true;
  } catch (error) {
    console.error('❌ Error clearing customer IDs:', error.message);
    console.warn('⚠️  Database cleanup failed, but mode switch will continue');
    return true; // Don't fail the entire process
  } finally {
    if (client) {
      await client.close();
    }
  }
}

function getCurrentMode() {
  try {
    const envVars = loadEnvVars();
    const stripeKeys = getStripeKeys();
    
    // Check what the active STRIPE_SECRET_KEY is set to
    const activeSecretKey = envVars.STRIPE_SECRET_KEY;
    
    if (activeSecretKey === stripeKeys.live.secret) {
      return 'live';
    } else if (activeSecretKey === stripeKeys.test.secret) {
      return 'test';
    } else {
      console.warn('⚠️  Active STRIPE_SECRET_KEY does not match any known keys');
      return 'unknown';
    }
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message);
    return null;
  }
}

function switchToMode(mode) {
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    const stripeKeys = getStripeKeys();
    const keys = stripeKeys[mode];
    
    // Validate that we have the required keys
    if (!keys.secret || !keys.publishable) {
      console.error(`❌ Missing ${mode.toUpperCase()} Stripe keys in .env file`);
      console.error(`Required: STRIPE_${mode.toUpperCase()}_SECRET_KEY and STRIPE_${mode.toUpperCase()}_PUBLISHABLE_KEY`);
      return false;
    }
    
    // Update Stripe keys
    envContent = envContent.replace(
      /STRIPE_SECRET_KEY=.*/,
      `STRIPE_SECRET_KEY=${keys.secret}`
    );
    
    envContent = envContent.replace(
      /STRIPE_PUBLISHABLE_KEY=.*/,
      `STRIPE_PUBLISHABLE_KEY=${keys.publishable}`
    );
    
    envContent = envContent.replace(
      /STRIPE_WEBHOOK_SECRET=.*/,
      `STRIPE_WEBHOOK_SECRET=${keys.webhook}`
    );
    
    fs.writeFileSync(envPath, envContent);
    return true;
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    return false;
  }
}

function updateFrontendEnv(mode) {
  const frontendEnvPath = path.join(__dirname, '../../.env');
  try {
    let envContent = '';
    if (fs.existsSync(frontendEnvPath)) {
      envContent = fs.readFileSync(frontendEnvPath, 'utf8');
    }
    
    const stripeKeys = getStripeKeys();
    const publishableKey = stripeKeys[mode].publishable;
    
    if (!publishableKey) {
      console.error(`❌ Missing ${mode.toUpperCase()} publishable key in backend .env file`);
      return false;
    }
    
    if (envContent.includes('VITE_STRIPE_PUBLISHABLE_KEY=')) {
      envContent = envContent.replace(
        /VITE_STRIPE_PUBLISHABLE_KEY=.*/,
        `VITE_STRIPE_PUBLISHABLE_KEY=${publishableKey}`
      );
    } else {
      envContent += `\nVITE_STRIPE_PUBLISHABLE_KEY=${publishableKey}\n`;
    }
    
    fs.writeFileSync(frontendEnvPath, envContent);
    return true;
  } catch (error) {
    console.error('❌ Error updating frontend .env file:', error.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const targetMode = args[0];
  
  if (!targetMode || !['test', 'live'].includes(targetMode)) {
    console.log('📋 Stripe Mode Switcher');
    console.log('Usage: node switch-stripe-mode.js [test|live]');
    console.log('');
    
    const currentMode = getCurrentMode();
    if (currentMode) {
      console.log(`🔍 Current mode: ${currentMode.toUpperCase()}`);
    }
    
    console.log('');
    console.log('Examples:');
    console.log('  node switch-stripe-mode.js test   # Switch to test mode');
    console.log('  node switch-stripe-mode.js live   # Switch to live mode');
    console.log('');
    console.log('💡 This script will:');
    console.log('  • Switch Stripe API keys in backend and frontend');
    console.log('  • Clear incompatible customer IDs from database');
    console.log('  • Handle all environment switching automatically');
    
    return;
  }
  
  const currentMode = getCurrentMode();
  
  if (currentMode === targetMode) {
    console.log(`✅ Already in ${targetMode.toUpperCase()} mode`);
    return;
  }
  
  console.log(`🔄 Switching from ${currentMode?.toUpperCase() || 'UNKNOWN'} to ${targetMode.toUpperCase()} mode...`);
  
  // Step 1: Clear customer IDs from database (before switching keys)
  console.log('\n📋 Step 1: Database cleanup');
  await clearStripeCustomerIds(targetMode);
  
  // Step 2: Update backend .env
  console.log('\n📋 Step 2: Update backend environment');
  if (!switchToMode(targetMode)) {
    console.error('❌ Failed to update backend .env file');
    return;
  }
  
  // Step 3: Update frontend .env
  console.log('\n📋 Step 3: Update frontend environment');
  if (!updateFrontendEnv(targetMode)) {
    console.error('❌ Failed to update frontend .env file');
    return;
  }
  
  console.log('\n🎉 Successfully switched to', targetMode.toUpperCase(), 'mode');
  console.log('');
  console.log('⚠️  Important next steps:');
  if (targetMode === 'live') {
    console.log('  • You are now using LIVE Stripe keys');
    console.log('  • Real payments will be processed');
    console.log('  • Start Stripe CLI with: stripe listen --forward-to localhost:3001/api/stripe/webhook --live');
  } else {
    console.log('  • You are now using TEST Stripe keys');
    console.log('  • Only test payments will be processed');
    console.log('  • Start Stripe CLI with: stripe listen --forward-to localhost:3001/api/stripe/webhook');
  }
  console.log('  • Restart your backend server to apply changes');
  console.log('  • Restart your frontend dev server to apply changes');
  console.log('  • All customer IDs have been cleared - new ones will be created automatically');
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
