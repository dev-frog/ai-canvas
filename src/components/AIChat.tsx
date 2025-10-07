'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, BookOpenIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { auth } from '@/lib/firebase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  onInsert: (text: string) => void;
  submissionId: string | null;
  tokensUsed: number;
  tokenLimit: number;
  onTokenUpdate: (tokensUsed: number) => void;
  assignmentTitle?: string;
  currentContent?: string;
}

export default function AIChat({ onInsert, submissionId, tokensUsed, tokenLimit, onTokenUpdate, assignmentTitle, currentContent }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate dynamic prompts based on assignment context
  const getQuickPrompts = () => {
    const hasContent = currentContent && currentContent.length > 100;
    const title = assignmentTitle || 'your assignment';

    if (!hasContent) {
      // Starting prompts
      return [
        { icon: LightBulbIcon, text: `Give me ideas to start writing about "${title}"`, color: 'text-yellow-600' },
        { icon: BookOpenIcon, text: `Find sources related to "${title}"`, color: 'text-blue-600' },
        { icon: SparklesIcon, text: `Help me create an outline for "${title}"`, color: 'text-purple-600' },
      ];
    } else {
      // Continuation prompts
      return [
        { icon: SparklesIcon, text: `Help me improve my current writing`, color: 'text-purple-600' },
        { icon: LightBulbIcon, text: `What should I write next?`, color: 'text-yellow-600' },
        { icon: BookOpenIcon, text: `Suggest sources to support my arguments`, color: 'text-blue-600' },
      ];
    }
  };

  const quickPrompts = getQuickPrompts();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!submissionId) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Please save your assignment first before using AI chat.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (tokensUsed >= tokenLimit) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Token Limit Reached!\n\nYou have used all ${tokenLimit} tokens for this assignment. You cannot use more AI assistance for this assignment.\n\nYour token usage: ${tokensUsed}/${tokenLimit}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Get Firebase auth token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      const idToken = await currentUser.getIdToken();

      // Call AI API with conversation history
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          submissionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();

      // Update tokens used
      if (data.tokensUsed !== undefined) {
        onTokenUpdate(data.tokensUsed);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);

      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-900">AI Research Assistant</h3>
            </div>
            <p className="text-xs text-gray-600 mt-1">Ask questions, get sources, or brainstorm ideas</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-gray-700">
              {tokensUsed}/{tokenLimit}
            </div>
            <div className="text-xs text-gray-500">tokens</div>
          </div>
        </div>
        {/* Token usage bar */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                tokensUsed >= tokenLimit ? 'bg-red-600' :
                tokensUsed / tokenLimit > 0.9 ? 'bg-red-500' :
                tokensUsed / tokenLimit > 0.7 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min((tokensUsed / tokenLimit) * 100, 100)}%` }}
            ></div>
          </div>
          {tokensUsed >= tokenLimit && (
            <p className="text-xs text-red-600 font-medium mt-1">
              ⚠️ Token limit reached! Cannot use more AI assistance.
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 px-2">
            <SparklesIcon className="h-12 w-12 mx-auto mb-3 text-purple-300" />
            <p className="text-sm font-medium">AI Research Assistant</p>
            <p className="text-xs mt-1">
              {assignmentTitle && assignmentTitle !== 'Untitled'
                ? `Get help with "${assignmentTitle}"`
                : 'Ask me anything to help with your writing'
              }
            </p>

            {/* Quick Prompts */}
            <div className="mt-6 space-y-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-start">
                    <prompt.icon className={`h-4 w-4 mr-2 mt-0.5 flex-shrink-0 ${prompt.color}`} />
                    <span className="text-xs text-gray-700">{prompt.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">{line}</p>
                  ))}
                </div>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => onInsert(message.content)}
                    className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Insert into document →
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed at bottom */}
      <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI anything..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 max-h-32"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
