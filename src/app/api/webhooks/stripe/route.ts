import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/models';
import connectToDatabase from '@/lib/mongodb';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Determine subscription tier based on price
  let subscriptionTier = 'free';
  let aiTokensLimit = 1000;

  if (subscription.items.data.length > 0) {
    const priceId = subscription.items.data[0].price.id;

    if (priceId === 'price_monthly_pro') {
      subscriptionTier = 'monthly';
      aiTokensLimit = 10000;
    } else if (priceId === 'price_yearly_pro') {
      subscriptionTier = 'yearly';
      aiTokensLimit = 15000;
    }
  }

  // Update user subscription
  await User.findByIdAndUpdate(user._id, {
    subscriptionStatus: subscription.status === 'active' ? 'active' : subscription.status,
    subscriptionTier,
    aiTokensLimit,
  });

  console.log(`Updated subscription for user ${user.email}: ${subscriptionTier}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Revert to free plan
  await User.findByIdAndUpdate(user._id, {
    subscriptionStatus: 'canceled',
    subscriptionTier: 'free',
    aiTokensLimit: 1000,
  });

  console.log(`Canceled subscription for user ${user.email}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Reset AI tokens for new billing period
  if (invoice.billing_reason === 'subscription_cycle') {
    await User.findByIdAndUpdate(user._id, {
      aiTokensUsed: 0,
    });

    console.log(`Reset AI tokens for user ${user.email}`);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription status
  await User.findByIdAndUpdate(user._id, {
    subscriptionStatus: 'past_due',
  });

  console.log(`Payment failed for user ${user.email}`);
}