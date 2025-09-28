'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
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
  QuestionMarkCircleIcon
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
  const [wordCount, setWordCount] = useState(0);
  const [aiAssistance, setAiAssistance] = useState<AIAssistance[]>([]);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [aiTokensUsed, setAiTokensUsed] = useState(0);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignment');

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
  }, [router, assignmentId]);

  // Auto-save functionality
  useEffect(() => {
    if (!content || !user) return;

    const autoSaveTimer = setTimeout(async () => {
      await saveContent();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [content, user]);

  // Update word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  const saveContent = async () => {
    if (!user || saving) return;

    setSaving(true);
    try {
      // TODO: Save to backend API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setLastSaved(new Date());
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
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview
              </button>

              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Assignment Info Panel */}
          {assignment && (
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
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
          <div className="flex-1 p-6">
            {showPreview ? (
              <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto">
                <div className="prose max-w-none">
                  {content ? (
                    <div dangerouslySetInnerHTML={{
                      __html: content.replace(/\n/g, '<br>')
                    }} />
                  ) : (
                    <p className="text-gray-500 italic">Your content will appear here...</p>
                  )}
                </div>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onSelect={handleTextSelection}
                placeholder="Start writing your assignment here..."
                className="w-full h-full resize-none border border-gray-200 rounded-lg p-6 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        </div>

        {/* AI Assistant Panel */}
        {showAIPanel && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-blue-500" />
                AI Assistant
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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