#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

function getCurrentMode() {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const stripeKeys = getStripeKeys();
    
    if (envContent.includes(stripeKeys.live.secret)) {
      return 'live';
    } else {
      return 'test';
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

function main() {
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
    
    return;
  }
  
  const currentMode = getCurrentMode();
  
  if (currentMode === targetMode) {
    console.log(`✅ Already in ${targetMode.toUpperCase()} mode`);
    return;
  }
  
  console.log(`🔄 Switching from ${currentMode?.toUpperCase() || 'UNKNOWN'} to ${targetMode.toUpperCase()} mode...`);
  
  // Update backend .env
  if (!switchToMode(targetMode)) {
    console.error('❌ Failed to update backend .env file');
    return;
  }
  
  // Update frontend .env
  if (!updateFrontendEnv(targetMode)) {
    console.error('❌ Failed to update frontend .env file');
    return;
  }
  
  console.log('✅ Successfully switched to', targetMode.toUpperCase(), 'mode');
  console.log('');
  console.log('⚠️  Important:');
  if (targetMode === 'live') {
    console.log('  • You are now using LIVE Stripe keys');
    console.log('  • Real payments will be processed');
    console.log('  • Make sure to start Stripe CLI with: stripe listen --forward-to localhost:3000/api/stripe/webhook --live');
  } else {
    console.log('  • You are now using TEST Stripe keys');
    console.log('  • Only test payments will be processed');
    console.log('  • Make sure to start Stripe CLI with: stripe listen --forward-to localhost:3000/api/stripe/webhook');
  }
  console.log('  • Restart your backend server to apply changes');
  console.log('  • Restart your frontend dev server to apply changes');
}

main();
