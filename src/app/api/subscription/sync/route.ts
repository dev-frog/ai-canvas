import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { User } from '@/lib/models';
import connectToDatabase from '@/lib/mongodb';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    await connectToDatabase();
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a Stripe customer ID
    if (!user.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        message: 'No subscription to sync',
        user: {
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
        }
      });
    }

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all',
      limit: 10,
    });

    console.log('Found subscriptions:', subscriptions.data.length);

    // Find active subscription
    const activeSubscription = subscriptions.data.find(
      sub => sub.status === 'active' || sub.status === 'trialing'
    );

    if (activeSubscription) {
      // Get the price ID from the subscription
      const priceId = activeSubscription.items.data[0].price.id;
      console.log('Active subscription price:', priceId);

      // Determine tier based on price
      let tier = 'free';
      if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY) {
        tier = 'monthly';
      } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY) {
        tier = 'yearly';
      }

      // Update user
      user.subscriptionTier = tier;
      user.subscriptionStatus = activeSubscription.status;
      user.stripeSubscriptionId = activeSubscription.id;

      // Update token limits
      if (tier === 'monthly') {
        user.aiTokensLimit = 10000;
      } else if (tier === 'yearly') {
        user.aiTokensLimit = 15000;
      }

      await user.save();

      console.log('User subscription synced:', user.email, tier);

      return NextResponse.json({
        success: true,
        message: 'Subscription synced successfully',
        user: {
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
          aiTokensLimit: user.aiTokensLimit,
        }
      });
    } else {
      // No active subscription found
      user.subscriptionTier = 'free';
      user.subscriptionStatus = 'free';
      user.aiTokensLimit = 1000;
      user.stripeSubscriptionId = undefined;

      await user.save();

      return NextResponse.json({
        success: true,
        message: 'No active subscription found, downgraded to free',
        user: {
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
          aiTokensLimit: user.aiTokensLimit,
        }
      });
    }
  } catch (error: any) {
    console.error('Subscription sync error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to sync subscription',
      },
      { status: 500 }
    );
  }
}
