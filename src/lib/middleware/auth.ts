import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { User } from '@/lib/models';
import connectToDatabase from '@/lib/mongodb';

export async function verifyAuthToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    await connectToDatabase();
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    return user;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// Alias for getAuth
export async function getAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Try to get from cookies
      const token = request.cookies.get('token')?.value;
      if (!token) {
        return null;
      }

      const decodedToken = await adminAuth.verifyIdToken(token);
      await connectToDatabase();
      const user = await User.findOne({ firebaseUid: decodedToken.uid });

      if (user) {
        return {
          uid: user.firebaseUid,
          email: user.email,
          role: user.role,
          name: user.name,
        };
      }
      return null;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    await connectToDatabase();
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (user) {
      return {
        uid: user.firebaseUid,
        email: user.email,
        role: user.role,
        name: user.name,
      };
    }

    return null;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const user = await verifyAuthToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(request, context, user);
  };
}

export function requireRole(roles: string[]) {
  return function (handler: Function) {
    return async (request: NextRequest, context: any) => {
      const user = await verifyAuthToken(request);

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      if (!roles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      return handler(request, context, user);
    };
  };
}