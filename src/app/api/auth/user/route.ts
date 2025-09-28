import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';

async function handler(request: NextRequest, context: any, user: any) {
  return NextResponse.json({
    success: true,
    user: {
      _id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionTier: user.subscriptionTier,
      aiTokensUsed: user.aiTokensUsed,
      aiTokensLimit: user.aiTokensLimit,
      preferences: user.preferences,
      classes: user.classes,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
    },
  });
}

export const GET = requireAuth(handler);