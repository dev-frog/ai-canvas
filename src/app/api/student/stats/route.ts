import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/middleware/auth';
import { Assignment, Submission } from '@/lib/models';
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
    const submittedSubmissions = assignmentSubmissions.filter((s: any) => s.status === 'submitted' || s.status === 'graded');

    // All draft submissions (including standalone drafts)
    const draftSubmissions = allSubmissions.filter((s: any) => s.status === 'draft');

    // Assignments that don't have any submission are pending
    const submittedAssignmentIds = assignmentSubmissions.map((s: any) => s.assignmentId?.toString()).filter(Boolean);
    const pendingAssignments = assignments.filter(
      (a: any) => !submittedAssignmentIds.includes(a._id.toString())
    ).length;

    const completedAssignments = assignmentSubmissions.filter((s: any) => s.status === 'graded').length;

    return NextResponse.json({
      success: true,
      stats: {
        totalAssignments,
        pendingAssignments,
        completedAssignments,
        draftSubmissions: draftSubmissions.length,
        aiTokensUsed: user.aiTokensUsed || 0,
        aiTokensLimit: user.aiTokensLimit || 1000,
      },
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
