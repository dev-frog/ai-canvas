'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
import {
  AcademicCapIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function TeacherDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalClasses: 3,
    totalStudents: 75,
    activeAssignments: 8,
    pendingGrading: 12,
    thisWeekSubmissions: 23,
    avgGrade: 87.5
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, []);

  const recentClasses = [
    {
      id: 1,
      name: "Advanced Chemistry",
      code: "CHEM301",
      students: 28,
      activeAssignments: 3,
      pendingGrading: 5
    },
    {
      id: 2,
      name: "Environmental Science",
      code: "ENVS201",
      students: 32,
      activeAssignments: 2,
      pendingGrading: 4
    },
    {
      id: 3,
      name: "General Chemistry",
      code: "CHEM101",
      students: 15,
      activeAssignments: 3,
      pendingGrading: 3
    }
  ];

  const recentSubmissions = [
    {
      id: 1,
      studentName: "Alice Johnson",
      assignment: "Lab Report: Chemical Reactions",
      submittedAt: "2024-01-08T14:30:00Z",
      status: "pending",
      aiUsage: 15
    },
    {
      id: 2,
      studentName: "Bob Smith",
      assignment: "Research Paper: Climate Change",
      submittedAt: "2024-01-08T16:45:00Z",
      status: "pending",
      aiUsage: 32
    },
    {
      id: 3,
      studentName: "Carol Davis",
      assignment: "Essay: Renewable Energy",
      submittedAt: "2024-01-07T11:20:00Z",
      status: "graded",
      aiUsage: 8,
      grade: 95
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getAiUsageColor = (percentage: number) => {
    if (percentage < 20) return 'text-green-600';
    if (percentage < 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, Professor {user?.name || 'Teacher'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your classes, assignments, and student progress from your dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Grading</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Grade</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgGrade}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Your Classes</h3>
            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
              <PlusIcon className="h-4 w-4 mr-1" />
              New Class
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {recentClasses.map((classItem) => (
              <div key={classItem.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {classItem.name}
                    </p>
                    <p className="text-sm text-gray-500">{classItem.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {classItem.students} students
                    </p>
                    <p className="text-xs text-gray-500">
                      {classItem.pendingGrading} pending reviews
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Submissions</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentSubmissions.map((submission) => (
              <div key={submission.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(submission.status)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {submission.studentName}
                      </p>
                      <p className="text-xs text-gray-500">{submission.assignment}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {submission.status === 'graded' && (
                        <span className="text-sm font-medium text-gray-900">
                          {submission.grade}%
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${getAiUsageColor(submission.aiUsage)}`}>
                      AI: {submission.aiUsage}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
              View All Submissions
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <DocumentTextIcon className="h-8 w-8 text-gray-400" />
            <div className="ml-3 text-left">
              <p className="font-medium text-gray-900">Create Assignment</p>
              <p className="text-sm text-gray-500">Design a new task</p>
            </div>
          </button>

          <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <AcademicCapIcon className="h-8 w-8 text-gray-400" />
            <div className="ml-3 text-left">
              <p className="font-medium text-gray-900">New Class</p>
              <p className="text-sm text-gray-500">Start a new course</p>
            </div>
          </button>

          <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
            <ClockIcon className="h-8 w-8 text-gray-400" />
            <div className="ml-3 text-left">
              <p className="font-medium text-gray-900">Grade Submissions</p>
              <p className="text-sm text-gray-500">Review student work</p>
            </div>
          </button>

          <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <ChartBarIcon className="h-8 w-8 text-gray-400" />
            <div className="ml-3 text-left">
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-500">Check class progress</p>
            </div>
          </button>
        </div>
      </div>

      {/* AI Usage Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              High AI Usage Detected
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              Some recent submissions show high AI assistance usage. Consider reviewing your AI policy with students.
            </p>
            <div className="mt-3">
              <button className="text-sm font-medium text-amber-800 hover:text-amber-900">
                Review submissions →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}