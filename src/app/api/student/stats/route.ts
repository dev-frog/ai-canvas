import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/middleware/auth';
import { Assignment, Submission, AIInteraction } from '@/lib/models';
import connectToDatabase from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET /api/student/stats
async function getStudentStats(request: NextRequest, context: any, user: any) {
  try {
    await connectToDatabase();

    // Get assignments from user's classes (if user has classes)
    let assignments = [];
    if (user.classes && user.classes.length > 0) {
      assignments = await Assignment.find({
        classId: { $in: user.classes },
        isPublished: true,
      });
    }

    const assignmentIds = assignments.map((a: any) => a._id);

    // Get all submissions for this student (both with and without assignments)
    const allSubmissions = await Submission.find({
      studentId: user._id,
    });

    // Filter submissions related to class assignments
    const assignmentSubmissions = allSubmissions.filter((s: any) =>
      s.assignmentId && assignmentIds.some((id: any) => id.toString() === s.assignmentId?.toString())
    );

    // Calculate stats
    const totalAssignments = assignments.length;

    // All draft submissions (including standalone drafts)
    const draftSubmissions = allSubmissions.filter((s: any) => s.status === 'draft');

    // Completed assignments (graded)
    const completedAssignments = assignmentSubmissions.filter((s: any) => s.status === 'graded').length;

    // Get assignment IDs that are completed or submitted
    const completedAssignmentIds = assignmentSubmissions
      .filter((s: any) => s.status === 'submitted' || s.status === 'graded')
      .map((s: any) => s.assignmentId?.toString())
      .filter(Boolean);

    // Pending assignments = Total - Completed - Submitted (but not graded)
    // OR assignments without submission or with draft submission
    const pendingAssignments = assignments.filter(
      (a: any) => !completedAssignmentIds.includes(a._id.toString())
    ).length;

    // Calculate token usage metrics
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get AI interactions for token metrics
    const allInteractions = await AIInteraction.find({ userId: user._id });

    const tokensToday = allInteractions
      .filter((i: any) => new Date(i.timestamp) >= todayStart)
      .reduce((sum: number, i: any) => sum + (i.tokenUsage || 0), 0);

    const tokensThisWeek = allInteractions
      .filter((i: any) => new Date(i.timestamp) >= weekStart)
      .reduce((sum: number, i: any) => sum + (i.tokenUsage || 0), 0);

    const tokensThisMonth = allInteractions
      .filter((i: any) => new Date(i.timestamp) >= monthStart)
      .reduce((sum: number, i: any) => sum + (i.tokenUsage || 0), 0);

    // Calculate tokens by type
    const tokensByType = allInteractions.reduce((acc: any, i: any) => {
      const type = i.type || 'other';
      acc[type] = (acc[type] || 0) + (i.tokenUsage || 0);
      return acc;
    }, {});

    // Calculate average tokens per submission
    const submissionsWithTokens = allSubmissions.filter(
      (s: any) => s.aiUsageStats?.tokensUsed > 0
    );
    const avgTokensPerSubmission = submissionsWithTokens.length > 0
      ? submissionsWithTokens.reduce((sum: number, s: any) =>
          sum + (s.aiUsageStats?.tokensUsed || 0), 0) / submissionsWithTokens.length
      : 0;

    const stats = {
      totalAssignments,
      pendingAssignments,
      completedAssignments,
      draftSubmissions: draftSubmissions.length,
      aiTokensUsed: user.aiTokensUsed || 0,
      aiTokensLimit: user.aiTokensLimit || 1000,
      tokenMetrics: {
        tokensToday,
        tokensThisWeek,
        tokensThisMonth,
        avgTokensPerSubmission: Math.round(avgTokensPerSubmission),
        totalInteractions: allInteractions.length,
        tokensByType,
      },
    };

    console.log('Student Stats Calculation:', {
      userId: user._id,
      userClasses: user.classes,
      totalAssignments,
      totalSubmissions: allSubmissions.length,
      assignmentSubmissions: assignmentSubmissions.length,
      pendingAssignments,
      completedAssignments,
      draftSubmissions: draftSubmissions.length,
    });

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student stats' },
      { status: 500 }
    );
  }
}

export const GET = requireRole(['student'])(getStudentStats);
