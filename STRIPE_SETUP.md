# Stripe Subscriptions Integration

## 🎉 Implementation Complete!

Your Claim Digital Assets app now has full Stripe subscription integration with three tiers: **Free**, **Pro**, and **Elite**.

## 📁 Files Created/Modified

### Backend Files:
- ✅ `backend/config/prices.js` - Price mapping configuration
- ✅ `backend/src/routes/billing.js` - Billing API endpoints
- ✅ `backend/src/routes/stripeWebhook.js` - Webhook handler
- ✅ `backend/src/middleware/requirePlan.js` - Plan gating middleware
- ✅ `backend/src/models/User.js` - Updated with subscription fields
- ✅ `backend/server.js` - Updated with billing routes
- ✅ `backend/.env` - Updated with Stripe keys

### Frontend Files:
- ✅ `src/pages/Billing.jsx` - Main billing page
- ✅ `src/pages/BillingSuccess.jsx` - Success page
- ✅ `src/pages/BillingCancel.jsx` - Cancel page
- ✅ `src/contexts/PlanContext.jsx` - Plan management context
- ✅ `src/App.jsx` - Updated with billing routes
- ✅ `.env` - Stripe publishable key

## 🔧 Setup Required

### 1. Create Stripe Products
Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products) and create:

**Pro Plan:**
- Name: "Pro Plan"
- Description: "Perfect for active users"
- Price: $9.99/month (recurring)
- Copy the **Price ID** (starts with `price_`)

**Elite Plan:**
- Name: "Elite Plan"
- Description: "Maximum earning potential"
- Price: $19.99/month (recurring)
- Copy the **Price ID** (starts with `price_`)

### 2. Update Price Configuration
Replace the price IDs in `backend/config/prices.js`:

```javascript
export const PRICE_MAP = {
  pro: 'price_YOUR_PRO_PRICE_ID_HERE',    // Replace with actual Pro price ID
  elite: 'price_YOUR_ELITE_PRICE_ID_HERE' // Replace with actual Elite price ID
};
```

## 🚀 Testing the Integration

### Prerequisites
- ✅ Stripe CLI installed and authenticated
- ✅ Webhook forwarding running: `stripe listen --forward-to http://localhost:3001/api/billing/webhook`
- ✅ Backend server running on port 3001
- ✅ Frontend server running on port 5173

### Test Flow:

1. **Navigate to billing page**: http://localhost:5173/billing
2. **Click "Choose Pro"** or "Choose Elite"
3. **Complete checkout** with test card: `4242 4242 4242 4242`
4. **Verify redirect** to success page
5. **Check webhook logs** in Stripe CLI terminal
6. **Verify user upgrade** by checking subscription status

### Test Cards:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 🔗 Available Endpoints

### Billing API Routes:
- `POST /api/billing/create-checkout-session` - Create Stripe checkout
- `POST /api/billing/create-portal-session` - Customer portal access
- `GET /api/billing/subscription` - Get user's subscription status
- `POST /api/billing/webhook` - Stripe webhook handler

### Frontend Routes:
- `/billing` - Main billing page (protected)
- `/billing/success` - Checkout success page
- `/billing/cancel` - Checkout cancel page

## 🛡️ Plan Gating

Use the `requirePlan` middleware to protect premium features:

```javascript
import { requirePlan } from '../middleware/requirePlan.js';

// Require Pro or Elite plan
router.get('/premium-feature', requirePlan('pro'), (req, res) => {
  res.json({ message: 'This is a premium feature!' });
});

// Require Elite plan only
router.get('/elite-feature', requirePlan('elite'), (req, res) => {
  res.json({ message: 'This is an elite feature!' });
});
```

## 📱 Frontend Plan Context

Access subscription info in any component:

```javascript
import { usePlan } from '../contexts/PlanContext';

function MyComponent() {
  const { subscription, isPro, isElite, isPlanActive } = usePlan();
  
  return (
    <div>
      {isPro && <p>You have Pro features!</p>}
      {isElite && <p>You have Elite features!</p>}
    </div>
  );
}
```

## 🌐 Environment Variables

### Backend (.env):
```
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_FROM_CLI
APP_BASE_URL=http://localhost:5173
```

### Frontend (.env):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
```

## 🚨 Security Notes

- ✅ Webhook signature verification implemented
- ✅ Authentication required for all billing endpoints
- ✅ Environment variables used for all secrets
- ✅ Plan verification on both frontend and backend

## 📋 Commands to Run Both Apps

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend  
npm run dev

# Terminal 3: Webhook forwarding
stripe listen --forward-to http://localhost:3001/api/billing/webhook
```

## 🎯 Next Steps

1. **Create Stripe products** and update price IDs in `backend/config/prices.js`
2. **Test the complete flow** with test cards
3. **Add plan-gated features** using the `requirePlan` middleware
4. **Customize the billing UI** to match your brand
5. **Set up production webhooks** in Stripe Dashboard for live environment

## 🎉 Ready to Claim Digital Assets!

Your subscription system is now ready! Users can upgrade to Pro ($9.99/month) or Elite ($19.99/month) plans and access premium features. The Free plan remains app-side only without Stripe integration.

**Brand**: Claim Digital Assets  
**Tagline**: Discover. Claim. Earn.
