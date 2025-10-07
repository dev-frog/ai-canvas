import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/mongodb';
import { Submission } from '@/lib/models';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const user = await getAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can use autocomplete' }, { status: 403 });
    }

    const { text, submissionId } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    // Check token limit
    await dbConnect();
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.studentId !== user.uid) {
      return NextResponse.json({ error: 'Unauthorized access to submission' }, { status: 403 });
    }

    const tokensUsed = submission.aiUsageStats?.tokensUsed || 0;
    const tokenLimit = submission.aiUsageStats?.tokenLimit || 1000;

    // Strictly enforce token limit - do not allow any requests if at or above limit
    if (tokensUsed >= tokenLimit) {
      return NextResponse.json({
        success: false,
        error: 'You have reached the token limit for this assignment',
        tokensUsed,
        tokenLimit
      }, { status: 429 });
    }

    // Get last 500 characters for context
    const context = text.slice(-500);

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are helping a student write their academic assignment. Based on the context below, suggest ONE SHORT sentence (10-15 words max) that continues their writing naturally. Only provide the suggestion, nothing else.

Context:
${context}

Suggestion:`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 50,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ success: true, suggestion: '' });
    }

    const data = await response.json();
    const suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tokensUsedInRequest = data.usageMetadata?.totalTokenCount || 0;

    // Update submission with tokens used, but cap at token limit
    if (tokensUsedInRequest > 0) {
      submission.aiUsageStats = submission.aiUsageStats || {};
      const currentTokens = submission.aiUsageStats.tokensUsed || 0;
      const newTotal = currentTokens + tokensUsedInRequest;

      // Cap at token limit to prevent exceeding
      submission.aiUsageStats.tokensUsed = Math.min(newTotal, tokenLimit);
      await submission.save();
    }

    const newTokensUsed = submission.aiUsageStats?.tokensUsed || 0;

    return NextResponse.json({
      success: true,
      suggestion: suggestion.trim(),
      tokensUsed: newTokensUsed,
      tokenLimit,
    });
  } catch (error) {
    console.error('Error in autocomplete:', error);
    return NextResponse.json({ success: true, suggestion: '' });
  }
}
