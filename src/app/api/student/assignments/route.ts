import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/middleware/auth';
import { Assignment, Submission } from '@/lib/models';
import connectToDatabase from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET /api/student/assignments
async function getStudentAssignments(request: NextRequest, context: any, user: any) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'pending', 'draft', 'submitted', 'graded'

    console.log('Getting assignments for user:', {
      userId: user._id,
      userClasses: user.classes,
      limit,
      statusFilter: status,
    });

    // Check if user has classes
    if (!user.classes || user.classes.length === 0) {
      console.log('User has no classes assigned');
      return NextResponse.json({
        success: true,
        assignments: [],
      });
    }

    // Get assignments from user's classes
    const assignments = await Assignment.find({
      classId: { $in: user.classes },
      isPublished: true,
    })
      .populate('classId', 'name')
      .sort({ dueDate: 1 })
      .lean();

    console.log(`Found ${assignments.length} assignments for user's classes`);

    const assignmentIds = assignments.map((a: any) => a._id);

    // Get all submissions for this student
    const submissions = await Submission.find({
      studentId: user._id,
      assignmentId: { $in: assignmentIds },
    }).lean();

    // Create a map of assignmentId -> submission
    const submissionMap = new Map();
    submissions.forEach((sub: any) => {
      if (sub.assignmentId) {
        submissionMap.set(sub.assignmentId.toString(), sub);
      }
    });

    // Combine assignments with their submission status
    let combinedData = assignments.map((assignment: any) => {
      const submission = submissionMap.get(assignment._id.toString());

      let status = 'pending';
      let progress = 0;

      if (submission) {
        status = submission.status;
        // Calculate progress based on word count or content length
        if (submission.status === 'submitted' || submission.status === 'graded') {
          progress = 100;
        } else if (submission.status === 'draft') {
          // Estimate progress based on content (rough estimate)
          const wordCount = submission.writingStats?.wordCount || 0;
          progress = Math.min(Math.round((wordCount / 500) * 100), 90); // Assume 500 words is full
        }
      }

      return {
        id: assignment._id,
        title: assignment.title,
        course: (assignment.classId as any)?.name || 'Unknown Course',
        dueDate: assignment.dueDate,
        status,
        progress,
        submission: submission ? {
          _id: submission._id,
          grade: submission.grade,
          feedback: submission.feedback,
          wordCount: submission.writingStats?.wordCount || 0,
        } : null,
      };
    });

    // Filter by status if provided
    if (status) {
      combinedData = combinedData.filter((item) => item.status === status);
    }

    // Limit results
    combinedData = combinedData.slice(0, limit);

    console.log(`Returning ${combinedData.length} assignments after filtering and limiting`);

    return NextResponse.json({
      success: true,
      assignments: combinedData,
    });
  } catch (error) {
    console.error('Get student assignments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student assignments' },
      { status: 500 }
    );
  }
}

export const GET = requireRole(['student'])(getStudentAssignments);
