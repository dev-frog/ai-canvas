'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
import dynamic from 'next/dynamic';
import AIAutocomplete from '@/components/AIAutocomplete';
import AIChat from '@/components/AIChat';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
});
import {
  DocumentTextIcon,
  BookOpenIcon,
  SparklesIcon,
  EyeIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  dueDate: string;
  maxWords?: number;
  citationStyle?: 'APA' | 'MLA' | 'Harvard' | 'Chicago';
}

interface AIAssistance {
  type: 'grammar' | 'style' | 'citation' | 'content' | 'plagiarism';
  suggestion: string;
  original: string;
  position: number;
  confidence: number;
}

export default function CanvasPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [aiAssistance, setAiAssistance] = useState<AIAssistance[]>([]);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [aiTokensUsed, setAiTokensUsed] = useState(0);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiContinueSuggestion, setAiContinueSuggestion] = useState('');
  const [showAIContinue, setShowAIContinue] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignment');
  const canvasId = searchParams.get('id');

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }
        if (currentUser.role !== 'student') {
          router.push('/dashboard');
          return;
        }
        setUser(currentUser);
        setAiTokensUsed(currentUser.aiTokensUsed || 0);

        // Load existing canvas document if ID provided
        if (canvasId) {
          const response = await fetch(`/api/canvas?id=${canvasId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.submission) {
              setSubmissionId(data.submission._id);
              setTitle(data.submission.title || 'Untitled');
              setContent(data.submission.content || '');
              setWordCount(data.submission.wordCount || 0);
            }
          }
        }

        // Load assignment if ID provided
        if (assignmentId) {
          // TODO: Fetch assignment details from API
          const mockAssignment: Assignment = {
            _id: assignmentId,
            title: 'Essay on Climate Change',
            description: 'Write a comprehensive essay discussing the impacts of climate change on global ecosystems.',
            requirements: [
              'Minimum 1500 words',
              'Include at least 5 scholarly sources',
              'Use APA citation style',
              'Original analysis and arguments'
            ],
            dueDate: '2024-02-15',
            maxWords: 2000,
            citationStyle: 'APA'
          };
          setAssignment(mockAssignment);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, assignmentId, canvasId]);

  // Auto-save functionality
  useEffect(() => {
    if (!user) return;
    // Don't auto-save if there's no content and title is still default
    if (!content && title === 'Untitled') return;

    const autoSaveTimer = setTimeout(async () => {
      await saveContent();
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [content, title, user, wordCount]);

  // Update word count
  useEffect(() => {
    // Strip HTML tags and count words
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textContent.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // Render math in preview
  useEffect(() => {
    if (showPreview && previewRef.current) {
      const renderMath = async () => {
        const katex = (await import('katex')).default;
        const html = previewRef.current?.innerHTML || '';
        const rendered = html.replace(/\$\$(.*?)\$\$/g, (match, expression) => {
          try {
            return katex.renderToString(expression, {
              throwOnError: false,
              displayMode: true,
            });
          } catch (e) {
            return match;
          }
        });
        if (previewRef.current && html !== rendered) {
          previewRef.current.innerHTML = rendered;
        }
      };
      renderMath();
    }
  }, [showPreview, content]);

  const saveContent = async () => {
    if (!user || saving) return;

    setSaving(true);
    try {
      if (submissionId) {
        // Update existing submission
        console.log('Updating submission:', submissionId);
        const response = await fetch('/api/canvas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: submissionId,
            title,
            content,
            wordCount,
            aiTokensUsed,
            status: 'draft'
          }),
        });

        const data = await response.json();
        console.log('Update response:', data);

        if (!response.ok) {
          console.error('Failed to save:', data);
          throw new Error(data.error || 'Failed to save');
        }

        if (data.success) {
          setLastSaved(new Date());
        }
      } else {
        // Create new submission
        console.log('Creating new submission');
        const response = await fetch('/api/canvas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            assignmentId,
          }),
        });

        const data = await response.json();
        console.log('Create response:', data);

        if (!response.ok) {
          console.error('Failed to create:', data);
          throw new Error(data.error || 'Failed to create');
        }

        if (data.success && data.submission) {
          setSubmissionId(data.submission._id);
          setLastSaved(new Date());
          // Update URL with submission ID
          router.replace(`/dashboard/canvas?id=${data.submission._id}${assignmentId ? `&assignment=${assignmentId}` : ''}`);
        }
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const getAIAssistance = async (text: string, type: 'grammar' | 'style' | 'citation' | 'content' = 'grammar') => {
    if (!user || isProcessingAI) return;

    setIsProcessingAI(true);
    try {
      // TODO: Call AI API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI processing

      // Mock AI suggestions
      const mockSuggestions: AIAssistance[] = [
        {
          type: 'grammar',
          suggestion: 'Consider changing "their" to "its" for proper subject-verb agreement.',
          original: 'The ecosystem and their biodiversity',
          position: text.indexOf('their'),
          confidence: 0.95
        },
        {
          type: 'style',
          suggestion: 'This sentence could be more concise. Consider: "Climate change significantly impacts global ecosystems."',
          original: 'Climate change is having a very significant impact on ecosystems around the world.',
          position: 0,
          confidence: 0.87
        }
      ];

      setAiAssistance(prev => [...prev, ...mockSuggestions]);
      setAiTokensUsed(prev => prev + 10); // Mock token usage
    } catch (error) {
      console.error('AI assistance failed:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const applySuggestion = (suggestion: AIAssistance) => {
    const newContent = content.replace(suggestion.original, suggestion.suggestion);
    setContent(newContent);
    setAiAssistance(prev => prev.filter(s => s !== suggestion));
  };

  const dismissSuggestion = (suggestion: AIAssistance) => {
    setAiAssistance(prev => prev.filter(s => s !== suggestion));
  };

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selected = content.substring(start, end);
      setSelectedText(selected);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!autocompleteEnabled || autocompleteSuggestions.length === 0) return;

    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      acceptSuggestion();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setAutocompleteSuggestions([]);
      setSelectedSuggestionIndex(0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < autocompleteSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => prev > 0 ? prev - 1 : 0);
    }
  };

  const acceptSuggestion = () => {
    if (autocompleteSuggestions.length > 0) {
      const suggestion = autocompleteSuggestions[selectedSuggestionIndex];
      setContent((prev) => prev + suggestion);
      setAutocompleteSuggestions([]);
      setSelectedSuggestionIndex(0);
    }
  };

  // Simulate autocomplete suggestions
  useEffect(() => {
    if (!autocompleteEnabled || !content) {
      setAutocompleteSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      // Mock autocomplete logic - in real app, this would call an API
      const lastWords = content.split(' ').slice(-2).join(' ').toLowerCase();
      const mockSuggestions: string[] = [];

      if (lastWords.includes('climate')) {
        mockSuggestions.push(' change impacts global ecosystems');
        mockSuggestions.push(' patterns are shifting rapidly');
        mockSuggestions.push(' science demonstrates clear evidence');
      }

      setAutocompleteSuggestions(mockSuggestions.slice(0, 6));
      setSelectedSuggestionIndex(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [content, autocompleteEnabled]);

  const generateCitation = async () => {
    if (!selectedText) return;

    setIsProcessingAI(true);
    try {
      // TODO: Call citation API
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockCitation = `(Smith, 2023, p. 45)`;
      const newContent = content.replace(selectedText, `${selectedText} ${mockCitation}`);
      setContent(newContent);
      setAiTokensUsed(prev => prev + 5);
    } catch (error) {
      console.error('Citation generation failed:', error);
    } finally {
      setIsProcessingAI(false);
      setSelectedText('');
    }
  };

  const handleAIContinue = async () => {
    if (isProcessingAI) return;

    setIsProcessingAI(true);
    setShowAIContinue(false);

    try {
      // TODO: Call actual AI API to continue writing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock AI response
      const suggestions = [
        ' This development has led to significant changes in how we approach environmental policy and climate action worldwide.',
        ' Furthermore, recent studies have shown that immediate action is crucial to mitigating these effects.',
        ' These findings suggest a complex relationship between human activity and environmental sustainability.',
      ];

      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setAiContinueSuggestion(randomSuggestion);
      setShowAIContinue(true);
      setAiTokensUsed(prev => prev + 15);
    } catch (error) {
      console.error('AI continue failed:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const acceptAIContinue = (text: string) => {
    setContent(prev => prev + text);
    setShowAIContinue(false);
    setAiContinueSuggestion('');
  };

  const rejectAIContinue = () => {
    setShowAIContinue(false);
    setAiContinueSuggestion('');
  };

  const insertFromChat = (text: string) => {
    setContent(prev => prev + '\n\n' + text);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {assignment?.title || 'New Assignment'}
              </h1>
              {assignment && (
                <p className="text-sm text-gray-500">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* New Assignment Button */}
            <button
              onClick={() => {
                // Clear all state
                setContent('');
                setTitle('Untitled');
                setSubmissionId(null);
                setAssignment(null);
                setAiAssistance([]);
                setAutocompleteSuggestions([]);
                setWordCount(0);
                setLastSaved(null);
                setSaving(false);

                // Navigate to clean canvas URL
                router.replace('/dashboard/canvas');
              }}
              className="ml-4 flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              title="Start a new assignment"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Word Count */}
            <div className="text-sm text-gray-500">
              <span className="font-medium">{wordCount}</span>
              {assignment?.maxWords && (
                <span>/{assignment.maxWords}</span>
              )} words
            </div>

            {/* AI Tokens */}
            <div className="text-sm text-gray-500">
              <BoltIcon className="h-4 w-4 inline mr-1" />
              {aiTokensUsed}/{user?.aiTokensLimit || 1000} tokens
            </div>

            {/* Save Status */}
            <div className="flex items-center text-sm text-gray-500">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Saving...
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Saved {lastSaved.toLocaleTimeString()}
                </>
              ) : (
                <>
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Not saved
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAIContinue}
                disabled={isProcessingAI || !content}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md text-sm font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title="Continue writing with AI"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                {isProcessingAI ? 'Generating...' : 'Continue Writing'}
              </button>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview
              </button>

              <button
                onClick={() => setShowAIChat(!showAIChat)}
                className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                  showAIChat
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                AI Chat
              </button>

              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                  showAIPanel
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Tools
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Assignment Info Panel */}
          {assignment && (
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-blue-800 mb-2">{assignment.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {assignment.requirements.map((req, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-500">
                  <QuestionMarkCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Writing Area */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white">
            {showPreview ? (
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`.overflow-y-auto::-webkit-scrollbar { display: none; }`}</style>
                <div className="max-w-4xl mx-auto p-12">
                  <div className="prose max-w-none" ref={previewRef}>
                    <h1 className="text-4xl font-bold mb-6">{title}</h1>
                    {content ? (
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                      <p className="text-gray-500 italic">Your content will appear here...</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Title Input - Fixed */}
                <div className="max-w-4xl mx-auto w-full px-12 pt-8 pb-4 border-b border-gray-100 flex-shrink-0">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        setTitle('Untitled');
                      }
                    }}
                    placeholder="Untitled"
                    className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent border-none p-0"
                  />
                </div>

                {/* Rich Text Editor - Scrollable */}
                <div className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style>{`.overflow-y-auto::-webkit-scrollbar { display: none; }`}</style>
                  <div className="max-w-4xl mx-auto w-full">
                    <RichTextEditor
                      content={content}
                      onChange={(newContent) => setContent(newContent)}
                      placeholder="Start writing your assignment here..."
                    />
                  </div>

                  {/* AI Continue Suggestion */}
                  {showAIContinue && aiContinueSuggestion && (
                    <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 z-50">
                      <AIAutocomplete
                        suggestion={aiContinueSuggestion}
                        onAccept={acceptAIContinue}
                        onReject={rejectAIContinue}
                        position={{ top: 0, left: 0 }}
                      />
                    </div>
                  )}
                </div>

                {/* Autocomplete Suggestions */}
                {autocompleteEnabled && autocompleteSuggestions.length > 0 && (
                  <div
                    className="absolute bottom-20 left-6 bg-white border border-gray-300 rounded-lg shadow-lg max-w-md z-50"
                    role="listbox"
                    aria-label="Autocomplete suggestions"
                  >
                    <div className="p-2 border-b border-gray-200 text-xs text-gray-500">
                      {autocompleteSuggestions.length} suggestion{autocompleteSuggestions.length !== 1 ? 's' : ''} - Use ↑/↓ to navigate, Tab/Enter to accept, Esc to dismiss
                    </div>
                    {autocompleteSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`p-3 cursor-pointer text-sm ${
                          index === selectedSuggestionIndex
                            ? 'bg-blue-50 text-blue-900'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedSuggestionIndex(index);
                          acceptSuggestion();
                        }}
                        role="option"
                        aria-selected={index === selectedSuggestionIndex}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}

                {/* Screen reader announcements */}
                <div
                  id="autocomplete-status"
                  className="sr-only"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {autocompleteEnabled && autocompleteSuggestions.length > 0 &&
                    `${autocompleteSuggestions.length} autocomplete suggestion${autocompleteSuggestions.length !== 1 ? 's' : ''} available`
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Chat Sidebar */}
        {showAIChat && (
          <div className="w-96 border-l border-gray-200 flex-shrink-0">
            <AIChat onInsert={insertFromChat} />
          </div>
        )}

        {/* AI Assistant Panel */}
        {showAIPanel && !showAIChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-blue-500" />
                AI Tools
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Autocomplete Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <label
                      htmlFor="autocomplete-toggle"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                      title="Show inline suggestions while you type. Use Tab to accept."
                    >
                      Autocomplete while typing
                    </label>
                    <div className="ml-2 group relative">
                      <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-20">
                        Show inline suggestions while you type. Use Tab to accept.
                      </div>
                    </div>
                  </div>
                  <button
                    id="autocomplete-toggle"
                    onClick={() => setAutocompleteEnabled(!autocompleteEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      autocompleteEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={autocompleteEnabled}
                    aria-label="Toggle autocomplete while typing"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autocompleteEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  When enabled, displays up to 6 inline autocomplete suggestions as you type, navigable with arrow keys and accepted with Tab or Enter.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => getAIAssistance(content, 'grammar')}
                    disabled={isProcessingAI}
                    className="flex items-center justify-center p-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Grammar
                  </button>
                  <button
                    onClick={() => getAIAssistance(content, 'style')}
                    disabled={isProcessingAI}
                    className="flex items-center justify-center p-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-1" />
                    Style
                  </button>
                  <button
                    onClick={generateCitation}
                    disabled={!selectedText || isProcessingAI}
                    className="flex items-center justify-center p-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    <BookOpenIcon className="h-4 w-4 mr-1" />
                    Cite
                  </button>
                  <button
                    onClick={() => getAIAssistance(content, 'content')}
                    disabled={isProcessingAI}
                    className="flex items-center justify-center p-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    <SparklesIcon className="h-4 w-4 mr-1" />
                    Ideas
                  </button>
                </div>
              </div>

              {/* AI Suggestions */}
              {aiAssistance.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Suggestions</h3>
                  {aiAssistance.map((suggestion, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {suggestion.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(suggestion.confidence * 100)}% confident
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{suggestion.suggestion}</p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => dismissSuggestion(suggestion)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => applySuggestion(suggestion)}
                          className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Text Actions */}
              {selectedText && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Text</h3>
                  <p className="text-sm text-blue-800 mb-3 italic">"{selectedText.substring(0, 50)}..."</p>
                  <button
                    onClick={generateCitation}
                    disabled={isProcessingAI}
                    className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    Generate Citation
                  </button>
                </div>
              )}

              {/* Processing Indicator */}
              {isProcessingAI && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}