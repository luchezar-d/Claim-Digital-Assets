# Production Troubleshooting Guide

## Webhook Not Working in Production

### 1. Check Stripe Dashboard Configuration

**Live Mode Webhook Endpoint:**
- URL: `https://your-domain.com/api/stripe/webhook`
- Events to send: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Webhook signing secret: Copy this to your production environment variables

### 2. Environment Variables Required in Production

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...  # Live secret key
STRIPE_PUBLISHABLE_KEY=pk_live_...  # Live publishable key  
STRIPE_WEBHOOK_SECRET=whsec_...  # Live webhook signing secret

# Database
MONGODB_URI=mongodb+srv://...

# Application
NODE_ENV=production
```

### 3. Common Issues & Solutions

#### Issue: Cart not clearing after purchase
**Cause:** Webhook not being called or failing
**Debug:**
1. Check Stripe Dashboard > Webhooks > [Your Endpoint] > Recent deliveries
2. Look for failed webhook attempts
3. Check application logs for webhook processing

#### Issue: No entitlements created
**Cause:** Database connection issues or webhook signature verification
**Debug:**
1. Check MongoDB connection in production
2. Verify webhook signature verification is working
3. Check if cart/user data exists in production database

#### Issue: Webhook signature verification failed
**Cause:** Wrong webhook secret or missing secret
**Solution:**
1. Copy the correct webhook signing secret from Stripe Dashboard
2. Set `STRIPE_WEBHOOK_SECRET` in production environment
3. Ensure webhook endpoint URL matches exactly

### 4. Testing Production Webhooks

Use Stripe CLI to test production webhooks:

```bash
# Test with live keys
stripe listen --forward-to https://your-domain.com/api/stripe/webhook --live
```

### 5. Debug Endpoints (for production debugging)

Add these endpoints temporarily for debugging:

- `GET /api/debug/webhook-config` - Check webhook configuration
- `GET /api/debug/recent-sessions` - Check recent Stripe sessions
- `GET /api/debug/cart-status/:userId` - Check user's cart status
- `POST /api/debug/simulate-webhook` - Simulate webhook processing

### 6. Production Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Database accessible from production
- [ ] Webhook endpoint configured in Stripe Dashboard (Live mode)
- [ ] SSL certificate valid for webhook endpoint
- [ ] Webhook signature verification enabled
- [ ] Application logs accessible for debugging

### 7. Monitoring

Monitor these metrics in production:
- Webhook success rate
- Entitlement creation rate
- Cart completion rate
- Error logs from webhook processing
