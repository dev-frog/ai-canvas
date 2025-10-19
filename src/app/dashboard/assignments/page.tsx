'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
import { auth } from '@/lib/firebase';
import {
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  createdDate: string;
  maxWords?: number;
  citationStyle: 'APA' | 'MLA' | 'Harvard' | 'Chicago';
  requirements: string[];
  status: 'draft' | 'published' | 'completed' | 'overdue';
  submissions?: number;
  totalStudents?: number;
  teacherName?: string;
  className?: string;
  progress?: number; // For students: completion percentage
  grade?: number; // For students: if graded
  feedback?: string; // For students: teacher feedback
}

export default function AssignmentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'completed' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdDate' | 'title'>('dueDate');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }
        setUser(currentUser);

        if (currentUser.role === 'student') {
          // Fetch saved submissions (canvases) from API
          if (auth.currentUser) {
            const idToken = await auth.currentUser.getIdToken();
            const response = await fetch('/api/canvas', {
              headers: {
                'Authorization': `Bearer ${idToken}`,
              },
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.submissions) {
                // Transform submissions into assignment format
                const submissionAssignments: Assignment[] = data.submissions.map((sub: any) => ({
                  _id: sub._id,
                  title: sub.title || 'Untitled',
                  description: sub.content ? sub.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No content yet',
                  subject: 'Personal Work',
                  dueDate: sub.updatedAt,
                  createdDate: sub.createdAt,
                  citationStyle: 'APA' as const,
                  requirements: [],
                  status: sub.status === 'submitted' ? 'completed' as const : 'draft' as const,
                  progress: sub.wordCount > 0 ? Math.min(100, Math.floor((sub.wordCount / 1000) * 100)) : 0,
                }));
                setAssignments(submissionAssignments);
                setFilteredAssignments(submissionAssignments);
              }
            } else {
              console.error('Failed to fetch submissions');
              setAssignments([]);
              setFilteredAssignments([]);
            }
          }
        } else {
          // Teacher/Admin - show mock assignments for now
          const mockAssignments: Assignment[] = [
            {
              _id: '1',
              title: 'Climate Change Essay',
              description: 'Write a comprehensive essay discussing the impacts of climate change on global ecosystems.',
              subject: 'Environmental Science',
              dueDate: '2024-02-15',
              createdDate: '2024-01-15',
              maxWords: 2000,
              citationStyle: 'APA',
              requirements: ['Minimum 1500 words', 'At least 5 scholarly sources', 'Original analysis'],
              status: 'published',
              submissions: 18,
              totalStudents: 25,
              className: 'Environmental Science 101'
            },
            {
              _id: '2',
              title: 'Research Methodology Paper',
              description: 'Design and propose a research study using quantitative methods.',
              subject: 'Research Methods',
              dueDate: '2024-02-25',
              createdDate: '2024-01-25',
              maxWords: 2500,
              citationStyle: 'APA',
              requirements: ['Detailed methodology', 'Literature review', 'Expected outcomes'],
              status: 'draft',
              submissions: 0,
              totalStudents: 22,
              className: 'Research Methods 201'
            },
            {
              _id: '3',
              title: 'Lab Report: Chemical Reactions',
              description: 'Document and analyze the results of chemistry lab experiments.',
              subject: 'Chemistry',
              dueDate: '2024-02-10',
              createdDate: '2024-01-20',
              maxWords: 1200,
              citationStyle: 'APA',
              requirements: ['Data analysis', 'Methodology description', 'Conclusions'],
              status: 'published',
              submissions: 20,
              totalStudents: 20,
              className: 'Chemistry 102'
            }
          ];
          setAssignments(mockAssignments);
          setFilteredAssignments(mockAssignments);
        }
      } catch (error) {
        console.error('Failed to load assignments:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = assignments;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'createdDate':
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredAssignments(filtered);
  }, [assignments, statusFilter, searchTerm, sortBy]);

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'published':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'draft':
        return <PencilIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'student' ? 'My Assignments' : 'Assignments'}
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.role === 'student'
                ? 'Track your assignments and submissions'
                : 'Manage assignments and track student progress'
              }
            </p>
          </div>

          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <Link
              href="/dashboard/assignments/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Assignment
            </Link>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="min-w-[140px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27%3e%3cpath d=%27M7 7l3 3 3-3%27 stroke=%27%239CA3AF%27 stroke-width=%271.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3e%3c/svg%3e')] bg-[length:1.5em] bg-[right_0.5rem_center] bg-no-repeat"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Sort */}
            <div className="min-w-[140px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27%3e%3cpath d=%27M7 7l3 3 3-3%27 stroke=%27%239CA3AF%27 stroke-width=%271.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3e%3c/svg%3e')] bg-[length:1.5em] bg-[right_0.5rem_center] bg-no-repeat"
              >
                <option value="dueDate">Due Date</option>
                <option value="createdDate">Created Date</option>
                <option value="title">Title</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } rounded-l-md border-r border-gray-300`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } rounded-r-md`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Assignments Grid/List */}
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : user?.role === 'student'
                ? 'No assignments have been assigned to you yet.'
                : 'Create your first assignment to get started.'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => (
              <div key={assignment._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {assignment.description}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)} ml-2`}>
                      {getStatusIcon(assignment.status)}
                      <span className="ml-1 capitalize">{assignment.status}</span>
                    </span>
                  </div>

                  {/* Subject and Class */}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <AcademicCapIcon className="h-4 w-4 mr-1" />
                    <span>{assignment.subject}</span>
                    {assignment.className && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{assignment.className}</span>
                      </>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center text-sm mb-4">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span className={`${
                      getDaysUntilDue(assignment.dueDate) < 0 ? 'text-red-600' :
                      getDaysUntilDue(assignment.dueDate) <= 3 ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      Due {formatDate(assignment.dueDate)}
                      {getDaysUntilDue(assignment.dueDate) < 0 ? ' (Overdue)' :
                       getDaysUntilDue(assignment.dueDate) === 0 ? ' (Today)' :
                       ` (${getDaysUntilDue(assignment.dueDate)} days)`}
                    </span>
                  </div>

                  {/* Progress or Submissions */}
                  {user?.role === 'student' ? (
                    assignment.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-900 font-medium">{assignment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${assignment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      <span>
                        {assignment.submissions || 0} / {assignment.totalStudents || 0} submissions
                      </span>
                    </div>
                  )}

                  {/* Grade (for students) */}
                  {user?.role === 'student' && assignment.grade !== undefined && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Grade</span>
                        <span className="text-lg font-bold text-green-900">{assignment.grade}%</span>
                      </div>
                      {assignment.feedback && (
                        <p className="text-sm text-green-700 mt-2">{assignment.feedback}</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    {user?.role === 'student' ? (
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/canvas?id=${assignment._id}`}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          {assignment.progress && assignment.progress > 0 ? 'Continue' : 'Open'}
                        </Link>
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this assignment?')) {
                              if (auth.currentUser) {
                                const idToken = await auth.currentUser.getIdToken();
                                const response = await fetch(`/api/canvas?id=${assignment._id}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${idToken}`,
                                  },
                                });
                                if (response.ok) {
                                  setAssignments(prev => prev.filter(a => a._id !== assignment._id));
                                  setFilteredAssignments(prev => prev.filter(a => a._id !== assignment._id));
                                }
                              }
                            }
                          }}
                          className="flex items-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm font-medium"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                          <ChartBarIcon className="h-4 w-4 mr-1" />
                          Analytics
                        </button>
                        <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium">
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {user?.role === 'student' ? (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                    ) : (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submissions
                      </th>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{assignment.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assignment.subject}</div>
                        {assignment.className && (
                          <div className="text-sm text-gray-500">{assignment.className}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          getDaysUntilDue(assignment.dueDate) < 0 ? 'text-red-600' :
                          getDaysUntilDue(assignment.dueDate) <= 3 ? 'text-yellow-600' :
                          'text-gray-900'
                        }`}>
                          {formatDate(assignment.dueDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getDaysUntilDue(assignment.dueDate) < 0 ? 'Overdue' :
                           getDaysUntilDue(assignment.dueDate) === 0 ? 'Due today' :
                           `${getDaysUntilDue(assignment.dueDate)} days left`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {getStatusIcon(assignment.status)}
                          <span className="ml-1 capitalize">{assignment.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user?.role === 'student' ? (
                          assignment.progress !== undefined ? (
                            <div>
                              <div className="text-sm text-gray-900">{assignment.progress}%</div>
                              <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${assignment.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Not started</span>
                          )
                        ) : (
                          <div className="text-sm text-gray-900">
                            {assignment.submissions || 0} / {assignment.totalStudents || 0}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {user?.role === 'student' ? (
                            <>
                              <Link
                                href={`/dashboard/canvas?id=${assignment._id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                {assignment.progress && assignment.progress > 0 ? 'Continue' : 'Open'}
                              </Link>
                              <button
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this assignment?')) {
                                    if (auth.currentUser) {
                                      const idToken = await auth.currentUser.getIdToken();
                                      const response = await fetch(`/api/canvas?id=${assignment._id}`, {
                                        method: 'DELETE',
                                        headers: {
                                          'Authorization': `Bearer ${idToken}`,
                                        },
                                      });
                                      if (response.ok) {
                                        setAssignments(prev => prev.filter(a => a._id !== assignment._id));
                                        setFilteredAssignments(prev => prev.filter(a => a._id !== assignment._id));
                                      }
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="text-blue-600 hover:text-blue-900">
                                Analytics
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                Edit
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}