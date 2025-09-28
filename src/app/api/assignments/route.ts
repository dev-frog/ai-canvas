import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/middleware/auth';
import { Assignment } from '@/lib/models';
import connectToDatabase from '@/lib/mongodb';

// GET /api/assignments
async function getAssignments(request: NextRequest, context: any, user: any) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');

    let query: any = {};

    // Filter based on user role
    if (user.role === 'student') {
      // Students can only see assignments from their classes
      if (classId) {
        query.classId = classId;
      } else {
        query.classId = { $in: user.classes };
      }
      query.isPublished = true;
    } else if (user.role === 'teacher') {
      // Teachers can see assignments they created or co-teach
      if (classId) {
        query.classId = classId;
      } else {
        query.teacherId = user._id;
      }
    }

    if (status) {
      query.isPublished = status === 'published';
    }

    const assignments = await Assignment.find(query)
      .populate('classId', 'name')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST /api/assignments
async function createAssignment(request: NextRequest, context: any, user: any) {
  try {
    await connectToDatabase();

    const {
      title,
      description,
      type,
      classId,
      dueDate,
      rubric,
      settings,
    } = await request.json();

    if (!title || !description || !type || !classId || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assignment = new Assignment({
      title,
      description,
      type,
      classId,
      teacherId: user._id,
      dueDate: new Date(dueDate),
      rubric: rubric || { criteria: [] },
      settings: {
        allowLateSubmission: settings?.allowLateSubmission || false,
        maxAIUsage: settings?.maxAIUsage || 50,
        plagiarismCheck: settings?.plagiarismCheck || true,
      },
      isPublished: false,
    });

    await assignment.save();

    return NextResponse.json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getAssignments);
export const POST = requireRole(['teacher', 'admin'])(createAssignment);