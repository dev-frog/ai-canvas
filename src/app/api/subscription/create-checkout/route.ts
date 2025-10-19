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
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.' },
        { status: 500 }
      );
    }

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

    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    console.log('Creating checkout session for price:', priceId);

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      console.log('Creating new Stripe customer for user:', user.email);
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
          firebaseUid: user.firebaseUid,
        },
      });

      customerId = customer.id;
      console.log('Created Stripe customer:', customerId);

      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(user._id, {
        stripeCustomerId: customerId,
      });
    }

    // Check if APP_URL is configured
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('Using app URL:', appUrl);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard/subscription?success=true`,
      cancel_url: `${appUrl}/dashboard/subscription?canceled=true`,
      metadata: {
        userId: user._id.toString(),
        priceId,
      },
    });

    console.log('Checkout session created:', session.id);

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
    });

    return NextResponse.json(
      {
        error: error.message || 'Failed to create checkout session',
        details: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}