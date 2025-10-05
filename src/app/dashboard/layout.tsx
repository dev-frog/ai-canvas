'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        } else {
          // If server call fails but Firebase user exists, try again later
          console.warn('Server auth check failed, but Firebase user exists. Will retry...');
          setTimeout(checkAuth, 2000); // Retry after 2 seconds
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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-100">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area with left margin for desktop sidebar */}
      <div className="md:ml-64">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="overflow-x-hidden overflow-y-auto bg-gray-100 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}