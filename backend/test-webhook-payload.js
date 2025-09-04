#!/usr/bin/env node

import './test-db.mjs';
import fetch from 'node-fetch';

// Simulate a real cart checkout webhook payload
const testWebhookPayload = {
  id: 'evt_test_webhook',
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_cart_checkout',
      object: 'checkout_session',
      mode: 'payment',
      customer: 'cus_test_customer',
      payment_status: 'paid',
      status: 'complete',
      metadata: {
        userId: '6722b3cb40f11fe43df5c33e', // Your admin user ID
        cartId: 'cart_test_id', 
        type: 'cart_checkout'
      }
    }
  }
};

console.log('🧪 Testing webhook with simulated cart checkout payload...');
console.log('📦 Payload metadata:', testWebhookPayload.data.object.metadata);

try {
  const response = await fetch('http://localhost:3001/api/billing/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'test_signature'
    },
    body: JSON.stringify(testWebhookPayload)
  });

  const result = await response.text();
  console.log('📊 Webhook response status:', response.status);
  console.log('📊 Webhook response:', result);

  if (response.ok) {
    console.log('✅ Webhook test completed successfully');
  } else {
    console.log('❌ Webhook test failed');
  }
} catch (error) {
  console.error('❌ Error sending test webhook:', error.message);
}

process.exit(0);
