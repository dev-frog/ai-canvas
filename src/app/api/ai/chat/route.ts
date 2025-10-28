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
      return NextResponse.json({ error: 'Only students can use AI chat' }, { status: 403 });
    }

    const { message, conversationHistory, submissionId } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not configured');
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    // Check token limit for this submission
    await dbConnect();
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check if user owns this submission
    if (submission.studentId !== user.uid) {
      return NextResponse.json({ error: 'Unauthorized access to submission' }, { status: 403 });
    }

    const tokensUsed = submission.aiUsageStats?.tokensUsed || 0;
    const tokenLimit = submission.aiUsageStats?.tokenLimit || 1000;

    // Strictly enforce token limit - do not allow any requests if at or above limit
    if (tokensUsed >= tokenLimit) {
      return NextResponse.json({
        success: false,
        error: 'You have reached the token limit (1000) for this assignment. You cannot use more AI assistance.',
        tokensUsed,
        tokenLimit
      }, { status: 429 });
    }

    // Build conversation context for Gemini
    const systemPrompt = `You are a concise AI Research Assistant for students. Help with brainstorming, sources, and writing improvement. Keep responses brief and focused.`;

    // Limit conversation history to reduce token usage
    // Only include last 2 exchanges (4 messages) for context
    let conversationContext = systemPrompt + '\n\n';
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-4);
      recentHistory.forEach((msg: { role: string; content: string }) => {
        // Truncate very long messages to save tokens
        const truncatedContent = msg.content.length > 500
          ? msg.content.substring(0, 500) + '...'
          : msg.content;
        conversationContext += `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${truncatedContent}\n`;
      });
    }
    conversationContext += `Student: ${message}\nAssistant:`;

    // Call Gemini API (using gemini-2.5-flash which is free)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                  text: conversationContext,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300, // Reduced from 1024 to ensure concise, helpful responses
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);

      // Provide more specific error messages
      let errorMessage = 'Failed to get AI response. ';
      if (response.status === 429) {
        errorMessage += 'API rate limit reached. Please try again in a moment.';
      } else if (response.status === 503) {
        errorMessage += 'AI service is temporarily unavailable. Please try again later.';
      } else if (response.status === 400) {
        errorMessage += 'Invalid request format. Please try rephrasing your question.';
      } else {
        errorMessage += 'Please try again or contact support if the issue persists.';
      }

      return NextResponse.json(
        {
          error: errorMessage,
          apiError: true,
          statusCode: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the response text from Gemini's response format
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response.';
    const tokensUsedInRequest = data.usageMetadata?.totalTokenCount || 0;

    // Update submission with tokens used, but cap at token limit
    if (submission && tokensUsedInRequest > 0) {
      submission.aiUsageStats = submission.aiUsageStats || {};
      const currentTokens = submission.aiUsageStats.tokensUsed || 0;
      const newTotal = currentTokens + tokensUsedInRequest;

      // Cap at token limit to prevent exceeding
      submission.aiUsageStats.tokensUsed = Math.min(newTotal, tokenLimit);
      submission.aiUsageStats.totalInteractions = (submission.aiUsageStats.totalInteractions || 0) + 1;
      await submission.save();
    }

    const newTokensUsed = submission.aiUsageStats?.tokensUsed || 0;
    const remainingTokens = Math.max(0, tokenLimit - newTokensUsed);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      tokensUsed: newTokensUsed,
      tokenLimit,
      remainingTokens,
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ error: 'Failed to process AI chat request' }, { status: 500 });
  }
}
