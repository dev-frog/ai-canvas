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

    if (tokensUsed >= tokenLimit) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        tokensUsed,
        tokenLimit
      });
    }

    // Extract context around cursor if |CURSOR| marker is present
    let context = text;
    if (text.includes('|CURSOR|')) {
      const parts = text.split('|CURSOR|');
      const beforeCursor = parts[0];
      const afterCursor = parts[1] || '';
      context = `${beforeCursor}[cursor position]${afterCursor}`;
    } else {
      // Fallback to last 500 characters if no cursor marker
      context = text.slice(-500);
    }

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
                  text: `You are helping a student write their academic assignment. The text shows where the cursor is currently positioned with [cursor position]. Provide 3-5 diverse, short suggestions (each 5-12 words) that could continue naturally from the cursor position. Provide ONLY the suggestions, one per line, nothing else.

Context:
${context}

Suggestions:`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 150,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error');
      return NextResponse.json({
        success: true,
        suggestions: []
      });
    }

    const data = await response.json();
    const suggestionsText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tokensUsedInRequest = data.usageMetadata?.totalTokenCount || 0;

    // Parse suggestions (one per line)
    const suggestions = suggestionsText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s && s.length > 0)
      .map(s => s.replace(/^[-*•]\s*/, '').trim()) // Remove list markers
      .map(s => s.startsWith(' ') ? s : ' ' + s) // Add leading space
      .slice(0, 6);

    // Update submission with tokens used
    if (tokensUsedInRequest > 0) {
      submission.aiUsageStats = submission.aiUsageStats || {};
      const currentTokens = submission.aiUsageStats.tokensUsed || 0;
      const newTotal = currentTokens + tokensUsedInRequest;

      submission.aiUsageStats.tokensUsed = Math.min(newTotal, tokenLimit);
      await submission.save();
    }

    const newTokensUsed = submission.aiUsageStats?.tokensUsed || 0;

    return NextResponse.json({
      success: true,
      suggestions,
      tokensUsed: newTokensUsed,
      tokenLimit,
    });
  } catch (error) {
    console.error('Error in autocomplete suggestions:', error);
    return NextResponse.json({
      success: true,
      suggestions: []
    });
  }
}
