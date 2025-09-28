import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { User } from '@/lib/models';
import connectToDatabase from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { idToken, name, role } = await request.json();

    if (!idToken || !name || !role) {
      return NextResponse.json(
        { error: 'ID token, name, and role are required' },
        { status: 400 }
      );
    }

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUid: uid });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Set AI token limits based on subscription
    let aiTokensLimit = 1000; // Free tier
    if (role === 'teacher' || role === 'admin') {
      aiTokensLimit = 5000; // Higher limits for educators
    }

    // Create new user
    const newUser = new User({
      firebaseUid: uid,
      email,
      name,
      role,
      subscriptionStatus: 'free',
      subscriptionTier: 'free',
      aiTokensUsed: 0,
      aiTokensLimit,
      classes: [],
      preferences: {
        citationStyle: 'APA',
        autoSave: true,
        aiAssistanceLevel: 'moderate',
      },
      lastLogin: new Date(),
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      user: {
        _id: newUser._id,
        firebaseUid: newUser.firebaseUid,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        subscriptionStatus: newUser.subscriptionStatus,
        subscriptionTier: newUser.subscriptionTier,
        aiTokensUsed: newUser.aiTokensUsed,
        aiTokensLimit: newUser.aiTokensLimit,
        preferences: newUser.preferences,
        classes: newUser.classes,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        lastLogin: newUser.lastLogin,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}