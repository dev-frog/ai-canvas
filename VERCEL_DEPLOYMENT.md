# Vercel Deployment Guide

## Environment Variables for Vercel

When deploying to Vercel, add these environment variables in your Vercel dashboard:

### Required Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_your_monthly_id
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_your_yearly_id

# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# App URL - SET THIS TO YOUR VERCEL DOMAIN
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

## Important Notes

### 1. App URL Configuration

**Option A (Recommended):** Set `NEXT_PUBLIC_APP_URL` to your production domain:
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Option B:** Leave it empty and the app will auto-detect the Vercel URL using `VERCEL_URL` (automatically provided by Vercel)

### 2. Stripe Webhook Setup

For production webhooks to work on Vercel:

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-app.vercel.app/api/subscription/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### 3. Production vs Test Mode

- For staging/preview: Use Stripe **test mode** keys (pk_test_..., sk_test_...)
- For production: Use Stripe **live mode** keys (pk_live_..., sk_live_...)

### 4. Firebase Private Key

When adding `FIREBASE_PRIVATE_KEY` to Vercel:
- Keep the quotes around the value
- Make sure newlines are represented as `\n`
- Example: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

## Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] `NEXT_PUBLIC_APP_URL` set to your Vercel domain
- [ ] Stripe webhook endpoint configured in Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` matches the one from Stripe Dashboard
- [ ] Using Stripe live mode keys for production
- [ ] MongoDB connection string is for production database
- [ ] Firebase configuration is for production project
- [ ] Test a subscription payment after deployment
- [ ] Verify webhook events are being received (check Vercel logs)

## Vercel Auto-Detection

The app automatically detects if it's running on Vercel:
- If `NEXT_PUBLIC_APP_URL` is set, it uses that
- Otherwise, it uses `VERCEL_URL` (automatically provided by Vercel)
- Falls back to `http://localhost:3000` for local development

## Testing After Deployment

1. Complete a test payment in test mode
2. Check Vercel function logs: `vercel logs --follow`
3. Verify subscription updates in your database
4. Check Stripe webhook logs in Stripe Dashboard

## Troubleshooting

### Webhooks not working?
- Check Stripe Dashboard > Webhooks > Your endpoint > Events
- Verify the endpoint URL matches your deployed URL
- Check Vercel function logs for errors
- Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

### Redirects going to wrong domain?
- Update `NEXT_PUBLIC_APP_URL` in Vercel dashboard
- Redeploy the application
- Clear browser cache

### "Unauthorized" errors?
- Check Firebase Admin credentials
- Verify `FIREBASE_PRIVATE_KEY` formatting
- Ensure MongoDB connection string is correct
