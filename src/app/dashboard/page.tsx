'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if there's a Firebase user (client-side)
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          router.push('/auth/login');
          return;
        }

        // Then try to get user data from server
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);

          // Redirect based on user role
          switch (currentUser.role) {
            case 'student':
              router.push('/dashboard/student');
              break;
            case 'teacher':
              router.push('/dashboard/teacher');
              break;
            case 'admin':
              router.push('/dashboard/admin');
              break;
            default:
              router.push('/dashboard/student');
          }
        } else {
          console.warn('Server auth check failed, but Firebase user exists');
          // Stay on this page and show loading while retrying
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Only redirect to login if there's no Firebase user
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    // Wait for Firebase auth to initialize
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        checkAuth();
      } else {
        router.push('/auth/login');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Redirecting...</h1>
        <p className="text-gray-600">Taking you to your dashboard</p>
      </div>
    </div>
  );
}