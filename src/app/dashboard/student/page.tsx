'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';
import {
  BookOpenIcon,
  PencilSquareIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    draftSubmissions: 0,
    aiTokensUsed: 0,
    aiTokensLimit: 1000
  });
  const [loading, setLoading] = useState(true);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);

  const loadAllData = async () => {
    try {
      // Wait for Firebase auth to be ready
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.error('No authenticated user');
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // Get the ID token for API calls
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        console.error('Firebase user not available');
        setLoading(false);
        return;
      }

      const idToken = await firebaseUser.getIdToken();

      // Load stats
      try {
        console.log('Fetching stats with token...');
        const statsResponse = await fetch('/api/student/stats', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        console.log('Stats response status:', statsResponse.status);
        const statsData = await statsResponse.json();
        console.log('Stats data received:', statsData);

        if (statsData.success && statsData.stats) {
          console.log('Setting stats:', statsData.stats);
          setStats(statsData.stats);
        } else {
          console.error('Failed to load stats:', statsData.error || statsData);
        }
      } catch (error) {
        console.error('Failed to load stats - Exception:', error);
      }

      // Load assignments
      try {
        console.log('Fetching assignments with token...');
        const assignmentsResponse = await fetch('/api/student/assignments?limit=5', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        console.log('Assignments response status:', assignmentsResponse.status);
        const assignmentsData = await assignmentsResponse.json();
        console.log('Assignments data received:', assignmentsData);

        if (assignmentsData.success && assignmentsData.assignments) {
          console.log('Setting assignments:', assignmentsData.assignments);
          setRecentAssignments(assignmentsData.assignments);
        } else {
          console.error('Failed to load assignments:', assignmentsData.error || assignmentsData);
        }
      } catch (error) {
        console.error('Failed to load assignments - Exception:', error);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'submitted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'draft':
        return <PencilSquareIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const aiUsagePercentage = user ? (user.aiTokensUsed / user.aiTokensLimit) * 100 : 0;

  const refreshData = async () => {
    setLoading(true);
    await loadAllData();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's an overview of your academic progress and upcoming assignments.
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => router.push('/dashboard/assignments')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/dashboard/assignments?status=pending')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/dashboard/assignments?status=graded')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/dashboard/assignments?status=draft')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PencilSquareIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draftSubmissions}</p>
            </div>
          </div>
        </button>
      </div>

      {/* AI Usage Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AI Assistant Usage</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Tokens Used</span>
          <span className="text-sm font-medium text-gray-900">
            {user?.aiTokensUsed || 0} / {user?.aiTokensLimit || 1000}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(aiUsagePercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {aiUsagePercentage >= 90 ?
            'You\'re approaching your monthly limit. Consider upgrading your plan.' :
            'You have plenty of AI assistance available this month.'
          }
        </p>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Assignments</h3>
        </div>
        {loading ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">Loading assignments...</p>
          </div>
        ) : recentAssignments.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No assignments found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentAssignments.map((assignment) => (
              <button
                key={assignment.id}
                onClick={() => {
                  // If there's a submission, go to canvas with submission ID
                  // Otherwise, go to canvas to start new submission
                  if (assignment.submission?._id) {
                    router.push(`/dashboard/canvas?submissionId=${assignment.submission._id}`);
                  } else {
                    router.push(`/dashboard/canvas?assignmentId=${assignment.id}`);
                  }
                }}
                className="w-full px-6 py-4 hover:bg-gray-50 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(assignment.status)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {assignment.title}
                      </p>
                      <p className="text-sm text-gray-500">{assignment.course}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="w-20 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${assignment.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {assignment.progress}%
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="px-6 py-3 bg-gray-50 text-center">
          <button
            onClick={() => router.push('/dashboard/assignments')}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            View All Assignments
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/dashboard/canvas')}
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <PencilSquareIcon className="h-8 w-8 text-gray-400" />
            <div className="ml-3 text-left">
              <p className="font-medium text-gray-900">Start New Assignment</p>
              <p className="text-sm text-gray-500">Begin working on a new task</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/classes')}
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <BookOpenIcon className="h-8 w-8 text-gray-400" />
            <div className="ml-3 text-left">
              <p className="font-medium text-gray-900">Join New Class</p>
              <p className="text-sm text-gray-500">Enter a class code to join</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/assignments?status=graded')}
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <CheckCircleIcon className="h-8 w-8 text-gray-400" />
            <div className="ml-3 text-left">
              <p className="font-medium text-gray-900">Review Feedback</p>
              <p className="text-sm text-gray-500">Check graded assignments</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}