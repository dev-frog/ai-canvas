import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

async function handler(request: NextRequest, context: any, user: any) {
  try {
    // Ensure user has all required fields with defaults
    const userData = {
      _id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name || 'User',
      role: user.role || 'student',
      subscriptionStatus: user.subscriptionStatus || 'active',
      subscriptionTier: user.subscriptionTier || 'free',
      aiTokensUsed: user.aiTokensUsed || 0,
      aiTokensLimit: user.aiTokensLimit || 1000,
      preferences: user.preferences || {
        citationStyle: 'APA',
        autoSave: true,
        aiAssistanceLevel: 'moderate'
      },
      classes: user.classes || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
    };

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);