import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/mongodb';
import { Submission } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can create canvas documents' }, { status: 403 });
    }

    const { title, content, assignmentId } = await req.json();

    await dbConnect();

    // Create new canvas document (submission)
    const submission = await Submission.create({
      studentId: user.uid,
      assignmentId: assignmentId || undefined,
      title: title || 'Untitled',
      content: content || '',
      status: 'draft',
    });

    return NextResponse.json({
      success: true,
      submission: {
        _id: submission._id.toString(),
        title: submission.title,
        content: submission.content,
        status: submission.status,
        wordCount: submission.writingStats?.wordCount || 0,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error creating canvas document:', error);
    return NextResponse.json({ error: 'Failed to create canvas document' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('id');

    await dbConnect();

    if (submissionId) {
      // Get specific submission
      const submission = await Submission.findById(submissionId);

      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }

      // Check if user owns this submission
      if (submission.studentId !== user.uid && user.role !== 'teacher' && user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        submission: {
          _id: submission._id.toString(),
          title: submission.title,
          content: submission.content,
          status: submission.status,
          wordCount: submission.writingStats?.wordCount || 0,
          assignmentId: submission.assignmentId,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt,
          aiUsageStats: submission.aiUsageStats,
        }
      });
    } else {
      // Get all submissions for the user
      const submissions = await Submission.find({ studentId: user.uid })
        .sort({ updatedAt: -1 })
        .limit(50);

      return NextResponse.json({
        success: true,
        submissions: submissions.map(sub => ({
          _id: sub._id.toString(),
          title: sub.title,
          content: sub.content,
          status: sub.status,
          wordCount: sub.writingStats?.wordCount || 0,
          assignmentId: sub.assignmentId,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
        }))
      });
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, content, status, wordCount, aiTokensUsed } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    await dbConnect();

    const submission = await Submission.findById(id);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check if user owns this submission
    if (submission.studentId !== user.uid && user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update submission
    if (title !== undefined) submission.title = title;
    if (content !== undefined) submission.content = content;
    if (status !== undefined) submission.status = status;

    await submission.save();

    return NextResponse.json({
      success: true,
      submission: {
        _id: submission._id.toString(),
        title: submission.title,
        content: submission.content,
        status: submission.status,
        wordCount: submission.writingStats?.wordCount || 0,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    await dbConnect();

    const submission = await Submission.findById(id);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check if user owns this submission
    if (submission.studentId !== user.uid && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Submission.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
}
