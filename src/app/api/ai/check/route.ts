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
      return NextResponse.json({ error: 'Only students can use AI check' }, { status: 403 });
    }

    const { text, type, submissionId } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!type || !['grammar', 'style', 'content'].includes(type)) {
      return NextResponse.json({ error: 'Valid type is required (grammar, style, content)' }, { status: 400 });
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
        success: false,
        error: 'You have reached the token limit (1000) for this assignment.',
        tokensUsed,
        tokenLimit
      }, { status: 429 });
    }

    // Create prompt based on type
    let promptText = '';
    if (type === 'grammar') {
      promptText = `You are an expert grammar checker. Analyze the following text and provide specific grammar corrections. For each issue found, provide:
1. The exact original text with the error
2. A clear explanation of what's wrong
3. The corrected version

Only return actual grammar errors (spelling, punctuation, subject-verb agreement, tense, etc). Return the response as a JSON array of objects with these fields: {"original": "text with error", "suggestion": "corrected text", "explanation": "what was wrong", "confidence": 0.0-1.0}

If no errors found, return an empty array.

Text to check:
${text}

Response (JSON only):`;
    } else if (type === 'style') {
      promptText = `You are an expert writing style advisor. Analyze the following text and provide specific style improvements. Focus on:
- Clarity and conciseness
- Word choice and variety
- Sentence structure
- Academic tone

For each suggestion, provide:
1. The exact original text
2. An improved version
3. Why it's better

Return the response as a JSON array of objects with: {"original": "original text", "suggestion": "improved text", "explanation": "why it's better", "confidence": 0.0-1.0}

Limit to top 3-5 most important suggestions.

Text to improve:
${text}

Response (JSON only):`;
    } else { // content
      promptText = `You are an academic writing advisor. Analyze the following text and provide content suggestions such as:
- Areas that need more detail or evidence
- Arguments that could be stronger
- Missing perspectives or counterarguments
- Better ways to structure ideas

For each suggestion, provide:
1. The relevant section of text
2. Your suggestion for improvement
3. Why this would help

Return the response as a JSON array of objects with: {"original": "relevant text section", "suggestion": "content improvement suggestion", "explanation": "why this helps", "confidence": 0.0-1.0}

Limit to top 3-4 most important suggestions.

Text to analyze:
${text}

Response (JSON only):`;
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
                  text: promptText,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: 'Failed to get AI suggestions' }, { status: response.status });
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const tokensUsedInRequest = data.usageMetadata?.totalTokenCount || 0;

    // Parse suggestions from response
    let suggestions = [];
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse suggestions:', error);
      suggestions = [];
    }

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
      suggestions: suggestions.map((s: any) => ({
        type,
        original: s.original || '',
        suggestion: s.suggestion || '',
        explanation: s.explanation || '',
        confidence: s.confidence || 0.85,
        position: text.indexOf(s.original) || 0,
      })),
      tokensUsed: newTokensUsed,
      tokenLimit,
    });
  } catch (error) {
    console.error('Error in AI check:', error);
    return NextResponse.json({ error: 'Failed to process AI check request' }, { status: 500 });
  }
}
