import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { User } from '@/lib/models';
import connectToDatabase from '@/lib/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Disable body parsing, need raw body for Stripe webhook verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log('Received Stripe event:', event.type);

    await connectToDatabase();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);

        // Get the subscription
        if (session.subscription && session.customer) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Update user in database
          const customerId = session.customer as string;
          const user = await User.findOne({ stripeCustomerId: customerId });

          if (user) {
            // Determine tier based on price
            const priceId = subscription.items.data[0].price.id;
            let tier = 'free';

            if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY) {
              tier = 'monthly';
            } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY) {
              tier = 'yearly';
            }

            // Update user subscription
            user.subscriptionTier = tier;
            user.subscriptionStatus = subscription.status;
            user.stripeSubscriptionId = subscription.id;

            // Update token limits based on tier
            if (tier === 'monthly') {
              user.aiTokensLimit = 10000;
            } else if (tier === 'yearly') {
              user.aiTokensLimit = 15000;
            }

            await user.save();
            console.log('User subscription updated:', user.email, tier);
          } else {
            console.error('User not found for customer:', customerId);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id);

        const user = await User.findOne({ stripeSubscriptionId: subscription.id });

        if (user) {
          user.subscriptionStatus = subscription.status;

          // If subscription is canceled or past_due, handle accordingly
          if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            user.subscriptionTier = 'free';
            user.aiTokensLimit = 1000;
          }

          await user.save();
          console.log('User subscription status updated:', user.email, subscription.status);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', subscription.id);

        const user = await User.findOne({ stripeSubscriptionId: subscription.id });

        if (user) {
          user.subscriptionTier = 'free';
          user.subscriptionStatus = 'canceled';
          user.aiTokensLimit = 1000;
          user.stripeSubscriptionId = undefined;

          await user.save();
          console.log('User downgraded to free:', user.email);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for invoice:', invoice.id);
        // Could send receipt email here
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed for invoice:', invoice.id);

        if (invoice.subscription) {
          const user = await User.findOne({ stripeSubscriptionId: invoice.subscription });
          if (user) {
            user.subscriptionStatus = 'past_due';
            await user.save();
            console.log('User subscription marked as past_due:', user.email);
          }
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
