# Stripe Integration Setup Guide

## Overview
This application uses Stripe for payment processing. Follow these steps to enable payments.

## Step 1: Get Your Stripe API Keys

1. Sign up for a Stripe account at https://stripe.com
2. Go to the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
3. Copy your **Publishable Key** (starts with `pk_test_` for test mode)

## Step 2: Update Frontend Configuration

1. Open `checkout.js`
2. Find the line: `const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QEXAMPLE_REPLACE_WITH_YOUR_KEY';`
3. Replace with your actual publishable key:
   ```javascript
   const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_ACTUAL_KEY_HERE';
   ```

## Step 3: Set Up Backend Server (Required for Production)

The current implementation includes a demo `createPaymentIntent` function. For production, you need a backend server.

### Backend Requirements

Create an endpoint that:
1. Receives course information
2. Creates a Stripe PaymentIntent
3. Returns the client secret

### Example Backend (Node.js/Express)

```javascript
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY');
const express = require('express');
const app = express();

app.post('/api/create-payment-intent', async (req, res) => {
  const { courseId, amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        courseId: courseId,
        userId: req.user.id
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Update Frontend to Use Backend

In `checkout.js`, replace the `createPaymentIntent` function:

```javascript
async function createPaymentIntent(course) {
  const user = Auth.getCurrentUser();
  
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}` // If using auth tokens
    },
    body: JSON.stringify({
      courseId: course.id,
      amount: course.price
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return await response.json();
}
```

## Step 4: Test Payments

### Test Card Numbers (Stripe Test Mode)

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any:
- Future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any ZIP code

## Step 5: Webhook Setup (Optional but Recommended)

Set up webhooks to handle payment events securely:

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Update enrollment status based on webhook events

## Security Notes

⚠️ **Important:**
- Never expose your Secret Key in frontend code
- Always use HTTPS in production
- Validate payments on your backend
- Use webhooks for critical operations
- Store payment records securely

## Current Implementation Status

✅ Frontend Stripe.js integration
✅ Payment form UI
✅ Course enrollment after payment
✅ Error handling
⚠️ Backend PaymentIntent creation (needs implementation)
⚠️ Webhook handling (optional)

## Support

For Stripe documentation:
- [Stripe Docs](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
