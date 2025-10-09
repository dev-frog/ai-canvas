'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
import dynamic from 'next/dynamic';
import AIAutocomplete from '@/components/AIAutocomplete';
import AIChat from '@/components/AIChat';
import { auth } from '@/lib/firebase';

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
  const [aiTokenLimit, setAiTokenLimit] = useState(1000);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiContinueSuggestion, setAiContinueSuggestion] = useState('');
  const [showAIContinue, setShowAIContinue] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'Essay' | 'Research Paper' | 'Report' | 'Case Study Response' | 'Literature Review' | 'Annotated Bibliography' | 'Reflective Writing/Journal' | ''>('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [previewType, setPreviewType] = useState<string | null>(null);

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

        // Show type modal for new canvas (no canvasId)
        if (!canvasId && !assignmentId) {
          setShowTypeModal(true);
        }

        // Load existing canvas document if ID provided
        if (canvasId && auth.currentUser) {
          const idToken = await auth.currentUser.getIdToken();
          const response = await fetch(`/api/canvas?id=${canvasId}`, {
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.submission) {
              setSubmissionId(data.submission._id);
              setTitle(data.submission.title || 'Untitled');
              setContent(data.submission.content || '');
              setAssignmentType(data.submission.assignmentType || '');
              setWordCount(data.submission.wordCount || 0);
              setAiTokensUsed(data.submission.aiUsageStats?.tokensUsed || 0);
              setAiTokenLimit(data.submission.aiUsageStats?.tokenLimit || 1000);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, title]);

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
    if (!user) return;
    if (saving) return;

    // Skip if no actual content to save
    if (!content && title === 'Untitled') return;

    setSaving(true);
    try {
      // Get fresh token from Firebase
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No authenticated user');
        return;
      }
      const idToken = await currentUser.getIdToken();

      if (submissionId) {
        // Update existing submission
        console.log('Updating submission:', submissionId);
        const response = await fetch('/api/canvas', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            id: submissionId,
            title,
            content,
            assignmentType,
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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            title,
            content,
            assignmentType,
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
          // Update URL with submission ID without reloading
          const newUrl = `/dashboard/canvas?id=${data.submission._id}${assignmentId ? `&assignment=${assignmentId}` : ''}`;
          window.history.replaceState({ ...window.history.state }, '', newUrl);
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

    if (!submissionId) {
      alert('Please save your assignment first before using AI assistance.');
      return;
    }

    if (aiTokensUsed >= aiTokenLimit) {
      alert('You have reached the token limit for this assignment.');
      return;
    }

    if (!text || text.length < 50) {
      alert('Please write at least 50 characters before requesting AI assistance.');
      return;
    }

    setIsProcessingAI(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      const idToken = await currentUser.getIdToken();

      const response = await fetch('/api/ai/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          text,
          type,
          submissionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI suggestions');
      }

      const data = await response.json();

      if (data.success && data.suggestions && data.suggestions.length > 0) {
        setAiAssistance(prev => [...prev, ...data.suggestions]);
        if (data.tokensUsed !== undefined) {
          setAiTokensUsed(data.tokensUsed);
        }
      } else {
        alert(`No ${type} suggestions found. Your writing looks good!`);
      }
    } catch (error) {
      console.error('AI assistance failed:', error);
      alert('Failed to get AI suggestions. Please try again.');
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

  const getTemplatePreview = (type: string): string => {
    const previews: Record<string, string> = {
      'Essay': `<div style="font-size: 12px; line-height: 1.4;">
        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Introduction</h3>
        <p style="color: #6B7280; margin: 4px 0;">Hook, background, thesis statement...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Body Paragraph 1</h3>
        <p style="color: #6B7280; margin: 4px 0;">Topic sentence, evidence, analysis...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Body Paragraph 2</h3>
        <p style="color: #6B7280; margin: 4px 0;">Topic sentence, evidence, analysis...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Conclusion</h3>
        <p style="color: #6B7280; margin: 4px 0;">Summary and closing thoughts...</p>
      </div>`,

      'Research Paper': `<div style="font-size: 12px; line-height: 1.4;">
        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Title Page</h3>
        <p style="color: #6B7280; margin: 4px 0;">Title, Author, Institution...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Abstract</h3>
        <p style="color: #6B7280; margin: 4px 0;">150-250 word summary...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Introduction</h3>
        <p style="color: #6B7280; margin: 4px 0;">Background, research question...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Literature Review</h3>
        <p style="color: #6B7280; margin: 4px 0;">Existing research synthesis...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Methodology</h3>
        <p style="color: #6B7280; margin: 4px 0;">Research design and methods...</p>
      </div>`,

      'Report': `<div style="font-size: 12px; line-height: 1.4;">
        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Executive Summary</h3>
        <p style="color: #6B7280; margin: 4px 0;">Key findings overview...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Introduction</h3>
        <p style="color: #6B7280; margin: 4px 0;">Purpose and scope...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Findings</h3>
        <p style="color: #6B7280; margin: 4px 0;">Key discoveries and data...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Recommendations</h3>
        <p style="color: #6B7280; margin: 4px 0;">Actionable suggestions...</p>
      </div>`,

      'Case Study Response': `<div style="font-size: 12px; line-height: 1.4;">
        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Case Overview</h3>
        <p style="color: #6B7280; margin: 4px 0;">Situation summary...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Problem Identification</h3>
        <p style="color: #6B7280; margin: 4px 0;">Main issues analysis...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Alternative Solutions</h3>
        <p style="color: #6B7280; margin: 4px 0;">Multiple options with pros/cons...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Recommended Solution</h3>
        <p style="color: #6B7280; margin: 4px 0;">Best approach with justification...</p>
      </div>`,

      'Literature Review': `<div style="font-size: 12px; line-height: 1.4;">
        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Introduction</h3>
        <p style="color: #6B7280; margin: 4px 0;">Topic and scope...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Theme 1</h3>
        <p style="color: #6B7280; margin: 4px 0;">Key studies and synthesis...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Theme 2</h3>
        <p style="color: #6B7280; margin: 4px 0;">Key studies and synthesis...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Critical Analysis</h3>
        <p style="color: #6B7280; margin: 4px 0;">Trends and debates...</p>
      </div>`,

      'Annotated Bibliography': `<div style="font-size: 12px; line-height: 1.4;">
        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Source 1</h3>
        <p style="color: #6B7280; margin: 4px 0;">Citation, Summary, Evaluation...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Source 2</h3>
        <p style="color: #6B7280; margin: 4px 0;">Citation, Summary, Evaluation...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Source 3</h3>
        <p style="color: #6B7280; margin: 4px 0;">Citation, Summary, Evaluation...</p>

        <p style="color: #6B7280; margin: 8px 0; font-style: italic;">Continue for all sources...</p>
      </div>`,

      'Reflective Writing/Journal': `<div style="font-size: 12px; line-height: 1.4;">
        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Experience Description</h3>
        <p style="color: #6B7280; margin: 4px 0;">What happened...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Initial Thoughts</h3>
        <p style="color: #6B7280; margin: 4px 0;">Immediate reactions...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Analysis</h3>
        <p style="color: #6B7280; margin: 4px 0;">Deeper interpretation...</p>

        <h3 style="font-size: 14px; font-weight: 600; margin: 8px 0;">Learning & Application</h3>
        <p style="color: #6B7280; margin: 4px 0;">Key insights and future actions...</p>
      </div>`
    };

    return previews[type] || '';
  };

  const getTemplateForType = (type: string): string => {
    const templates: Record<string, string> = {
      'Essay': `<h2>Introduction</h2>
<p contenteditable="true" class="placeholder-text" style="color: #9CA3AF; font-style: italic;">Start with an attention-grabbing hook... Provide context and background... State your thesis...</p>

<h2>Body Paragraph 1</h2>
<p contenteditable="true" class="placeholder-text" style="color: #9CA3AF; font-style: italic;">Topic sentence introducing your first main point...</p>
<p contenteditable="true" class="placeholder-text" style="color: #9CA3AF; font-style: italic;">Supporting evidence and analysis...</p>

<h2>Body Paragraph 2</h2>
<p contenteditable="true" class="placeholder-text" style="color: #9CA3AF; font-style: italic;">Topic sentence introducing your second main point...</p>
<p contenteditable="true" class="placeholder-text" style="color: #9CA3AF; font-style: italic;">Supporting evidence and analysis...</p>

<h2>Body Paragraph 3</h2>
<p contenteditable="true" class="placeholder-text" style="color: #9CA3AF; font-style: italic;">Topic sentence introducing your third main point...</p>
<p contenteditable="true" class="placeholder-text" style="color: #9CA3AF; font-style: italic;">Supporting evidence and analysis...</p>

<h2>Conclusion</h2>
<p contenteditable="true" class="placeholder-text" style="color: #9CA3AF; font-style: italic;">Restate thesis and summarize main points... Leave reader with final thoughts...</p>

<h2>References</h2>
<p contenteditable="true" class="placeholder-text" style="color: #9CA3AF; font-style: italic;">List your sources in proper citation format...</p>`,

      'Research Paper': `<h1>Title Page</h1>
<p><strong>Title:</strong> [Your Research Paper Title]</p>
<p><strong>Author:</strong> [Your Name]</p>
<p><strong>Institution:</strong> [Your Institution]</p>
<p><strong>Date:</strong> [Date]</p>

<h2>Abstract</h2>
<p>A brief summary (150-250 words) of your research paper including: research question, methodology, key findings, and conclusions.</p>

<h2>Introduction</h2>
<p><strong>Background:</strong> Provide context for your research topic.</p>
<p><strong>Research Question/Hypothesis:</strong> Clearly state what you're investigating.</p>
<p><strong>Significance:</strong> Explain why this research matters.</p>
<p><strong>Scope:</strong> Define the boundaries of your research.</p>

<h2>Literature Review</h2>
<p>Summarize and synthesize existing research on your topic. Identify gaps in current knowledge that your research addresses. Organize by themes, methodologies, or chronologically.</p>

<h2>Methodology</h2>
<p><strong>Research Design:</strong> Describe your approach (qualitative, quantitative, mixed-methods).</p>
<p><strong>Data Collection:</strong> Explain how you gathered information.</p>
<p><strong>Analysis Methods:</strong> Detail how you analyzed your data.</p>
<p><strong>Limitations:</strong> Acknowledge potential weaknesses in your methodology.</p>

<h2>Results/Findings</h2>
<p>Present your findings objectively. Use tables, charts, or graphs where appropriate. Organize findings logically, often corresponding to your research questions.</p>

<h2>Discussion</h2>
<p>Interpret your results. Explain what your findings mean. Compare with existing literature. Discuss implications and applications. Address unexpected results.</p>

<h2>Conclusion</h2>
<p>Summarize key findings. Restate the significance of your research. Suggest directions for future research.</p>

<h2>References</h2>
<p>[List all sources cited in your paper using appropriate citation format]</p>`,

      'Report': `<h1>Executive Summary</h1>
<p>A brief overview of the entire report (1-2 paragraphs). Include: purpose, key findings, main conclusions, and primary recommendations.</p>

<h2>Table of Contents</h2>
<p>1. Introduction<br>
2. Background<br>
3. Methodology<br>
4. Findings<br>
5. Analysis<br>
6. Recommendations<br>
7. Conclusion<br>
8. Appendices</p>

<h2>1. Introduction</h2>
<p><strong>Purpose:</strong> State the objective of this report.</p>
<p><strong>Scope:</strong> Define what is and isn't covered.</p>
<p><strong>Audience:</strong> Identify the intended readers.</p>

<h2>2. Background</h2>
<p>Provide context and relevant background information. Include historical information if relevant. Define key terms and concepts.</p>

<h2>3. Methodology</h2>
<p>Describe how information was gathered. Explain any analytical frameworks used. Discuss data sources and their reliability.</p>

<h2>4. Findings</h2>
<p><strong>Finding 1:</strong> [Present first key finding with supporting data]</p>
<p><strong>Finding 2:</strong> [Present second key finding with supporting data]</p>
<p><strong>Finding 3:</strong> [Present third key finding with supporting data]</p>

<h2>5. Analysis</h2>
<p>Interpret the findings. Identify patterns and trends. Discuss implications. Compare with benchmarks or standards if applicable.</p>

<h2>6. Recommendations</h2>
<p><strong>Recommendation 1:</strong> [Specific action with justification]</p>
<p><strong>Recommendation 2:</strong> [Specific action with justification]</p>
<p><strong>Recommendation 3:</strong> [Specific action with justification]</p>

<h2>7. Conclusion</h2>
<p>Summarize main points. Reinforce key recommendations. Provide closing remarks.</p>

<h2>8. References</h2>
<p>[List all sources]</p>

<h2>9. Appendices</h2>
<p>[Include supporting documents, raw data, detailed charts, or supplementary information]</p>`,

      'Case Study Response': `<h2>Case Overview</h2>
<p><strong>Case Title:</strong> [Name of the case]</p>
<p><strong>Key Issue:</strong> Briefly state the main problem or situation.</p>
<p><strong>Stakeholders:</strong> List the main people or groups involved.</p>

<h2>Situation Analysis</h2>
<p><strong>Context:</strong> Describe the background and circumstances of the case.</p>
<p><strong>Key Facts:</strong> List the most important information from the case.</p>
<ul>
  <li>Fact 1</li>
  <li>Fact 2</li>
  <li>Fact 3</li>
</ul>

<h2>Problem Identification</h2>
<p><strong>Primary Problem:</strong> State the main issue that needs to be addressed.</p>
<p><strong>Secondary Issues:</strong> Identify related problems or contributing factors.</p>
<p><strong>Root Causes:</strong> Analyze underlying reasons for the problems.</p>

<h2>Alternative Solutions</h2>
<p><strong>Option 1:</strong> [Describe first potential solution]</p>
<p><em>Pros:</em> [List advantages]</p>
<p><em>Cons:</em> [List disadvantages]</p>

<p><strong>Option 2:</strong> [Describe second potential solution]</p>
<p><em>Pros:</em> [List advantages]</p>
<p><em>Cons:</em> [List disadvantages]</p>

<p><strong>Option 3:</strong> [Describe third potential solution]</p>
<p><em>Pros:</em> [List advantages]</p>
<p><em>Cons:</em> [List disadvantages]</p>

<h2>Recommended Solution</h2>
<p><strong>Selected Approach:</strong> State which option you recommend and why.</p>
<p><strong>Justification:</strong> Explain why this is the best solution based on analysis.</p>
<p><strong>Expected Outcomes:</strong> Describe anticipated results.</p>

<h2>Implementation Plan</h2>
<p><strong>Action Steps:</strong></p>
<ol>
  <li>First action with timeline</li>
  <li>Second action with timeline</li>
  <li>Third action with timeline</li>
</ol>
<p><strong>Resources Needed:</strong> List required resources (time, money, personnel, etc.)</p>
<p><strong>Potential Challenges:</strong> Identify possible obstacles and mitigation strategies.</p>

<h2>Conclusion</h2>
<p>Summarize your analysis and recommendation. Reflect on lessons learned from the case.</p>

<h2>References</h2>
<p>[Cite any external sources used in your analysis]</p>`,

      'Literature Review': `<h2>Introduction</h2>
<p><strong>Topic Overview:</strong> Introduce your research topic and its significance.</p>
<p><strong>Purpose:</strong> Explain the purpose of this literature review.</p>
<p><strong>Scope:</strong> Define what literature is included and excluded.</p>
<p><strong>Organization:</strong> Briefly describe how the review is structured.</p>

<h2>Search Methodology</h2>
<p><strong>Databases Used:</strong> List the academic databases searched.</p>
<p><strong>Keywords:</strong> Specify search terms used.</p>
<p><strong>Selection Criteria:</strong> Explain inclusion/exclusion criteria.</p>
<p><strong>Time Period:</strong> State the date range of literature reviewed.</p>

<h2>Theme 1: [First Major Theme]</h2>
<p><strong>Overview:</strong> Introduce this theme or area of research.</p>
<p><strong>Key Studies:</strong></p>
<p>Author (Year) found that... [Summarize finding and its significance]</p>
<p>Author (Year) demonstrated... [Summarize finding]</p>
<p>Author (Year) argued... [Summarize argument]</p>
<p><strong>Synthesis:</strong> Discuss patterns, agreements, and disagreements among studies.</p>
<p><strong>Gaps:</strong> Identify what's missing or needs further research.</p>

<h2>Theme 2: [Second Major Theme]</h2>
<p><strong>Overview:</strong> Introduce this theme or area of research.</p>
<p><strong>Key Studies:</strong></p>
<p>Author (Year) explored... [Summarize contribution]</p>
<p>Author (Year) challenged... [Summarize perspective]</p>
<p>Author (Year) expanded... [Summarize development]</p>
<p><strong>Synthesis:</strong> Discuss connections and contradictions.</p>
<p><strong>Gaps:</strong> Identify research opportunities.</p>

<h2>Theme 3: [Third Major Theme]</h2>
<p><strong>Overview:</strong> Introduce this theme or area of research.</p>
<p><strong>Key Studies:</strong></p>
<p>[Continue pattern from above themes]</p>
<p><strong>Synthesis:</strong> Analyze relationships between studies.</p>
<p><strong>Gaps:</strong> Note areas needing investigation.</p>

<h2>Critical Analysis</h2>
<p><strong>Methodological Trends:</strong> Discuss common research approaches in the field.</p>
<p><strong>Theoretical Frameworks:</strong> Analyze dominant theories and perspectives.</p>
<p><strong>Evolution of Thought:</strong> Describe how understanding has developed over time.</p>
<p><strong>Controversies and Debates:</strong> Highlight ongoing disagreements or discussions.</p>

<h2>Research Gaps and Future Directions</h2>
<p>Identify significant gaps in current literature. Suggest areas for future research. Explain the importance of addressing these gaps.</p>

<h2>Conclusion</h2>
<p>Summarize main findings from the literature. Restate key themes and patterns. Emphasize the contribution of this review. Suggest implications for practice or policy.</p>

<h2>References</h2>
<p>[Comprehensive list of all sources cited, formatted according to required citation style]</p>`,

      'Annotated Bibliography': `<h1>Annotated Bibliography</h1>
<p><strong>Topic:</strong> [Your Research Topic]</p>
<p><strong>Purpose:</strong> [Brief explanation of why you're compiling these sources]</p>

<hr>

<h3>Source 1</h3>
<p><strong>Citation:</strong> Author, A. A. (Year). Title of work. <em>Journal Name</em>, volume(issue), pages. DOI or URL</p>

<p><strong>Summary:</strong> Briefly describe the main points, arguments, or findings of this source (3-4 sentences). What is the author's thesis? What evidence do they provide?</p>

<p><strong>Evaluation:</strong> Assess the source's credibility, reliability, and quality (2-3 sentences). Consider the author's credentials, publication venue, methodology, and bias.</p>

<p><strong>Relevance:</strong> Explain how this source relates to your research topic (2-3 sentences). How does it support your thesis or help answer your research question?</p>

<hr>

<h3>Source 2</h3>
<p><strong>Citation:</strong> Author, B. B., & Author, C. C. (Year). Title of work. <em>Journal Name</em>, volume(issue), pages. DOI or URL</p>

<p><strong>Summary:</strong> [Summarize the main content of the source. What are the key points or findings?]</p>

<p><strong>Evaluation:</strong> [Assess the quality and credibility. Is this a scholarly source? What are its strengths and weaknesses?]</p>

<p><strong>Relevance:</strong> [Explain how this source contributes to your research. How does it compare to other sources?]</p>

<hr>

<h3>Source 3</h3>
<p><strong>Citation:</strong> Author, D. D. (Year). <em>Title of book</em>. Publisher.</p>

<p><strong>Summary:</strong> [Describe the main arguments and content of the book or book chapter.]</p>

<p><strong>Evaluation:</strong> [Critique the work. Is the argument well-supported? Are there any limitations?]</p>

<p><strong>Relevance:</strong> [Discuss how this source fits into your research. Does it support, contradict, or complement other sources?]</p>

<hr>

<h3>Source 4</h3>
<p><strong>Citation:</strong> [Follow appropriate citation format for your source type]</p>

<p><strong>Summary:</strong> [Main points and findings]</p>

<p><strong>Evaluation:</strong> [Quality assessment]</p>

<p><strong>Relevance:</strong> [Connection to research topic]</p>

<hr>

<h3>Source 5</h3>
<p><strong>Citation:</strong> [Follow appropriate citation format]</p>

<p><strong>Summary:</strong> [Key content]</p>

<p><strong>Evaluation:</strong> [Credibility analysis]</p>

<p><strong>Relevance:</strong> [Research significance]</p>

<hr>

<p><em>Note: Continue adding sources following the same format. Organize sources alphabetically, chronologically, or thematically depending on your assignment requirements.</em></p>`,

      'Reflective Writing/Journal': `<h2>Entry Date: [Today's Date]</h2>

<h3>Experience/Event Description</h3>
<p><strong>What happened?</strong> Describe the experience, event, or learning situation you're reflecting on. Include relevant details about when, where, and what occurred. Set the context for your reflection.</p>

<h3>Initial Thoughts and Feelings</h3>
<p><strong>What was your immediate reaction?</strong> Describe your initial emotional and intellectual responses. How did you feel during and immediately after the experience? What stood out to you?</p>

<h3>Analysis and Interpretation</h3>
<p><strong>Why did this happen?</strong> Analyze the experience more deeply. What factors contributed to the situation? What patterns or connections do you notice? How does this relate to theories or concepts you've learned?</p>

<p><strong>Different Perspectives:</strong> Consider alternative viewpoints. How might others have experienced this situation? What assumptions were you making?</p>

<h3>Personal Learning and Insights</h3>
<p><strong>What did you learn?</strong> Identify key takeaways from this experience. What new understanding have you gained? How has your perspective changed? What surprised you?</p>

<p><strong>Connections to Previous Knowledge:</strong> How does this experience connect to what you already knew? Does it confirm, challenge, or extend your existing understanding?</p>

<h3>Challenges and Growth</h3>
<p><strong>What was difficult?</strong> Discuss any challenges or discomfort you experienced. What made these aspects difficult? How did you respond to these challenges?</p>

<p><strong>Growth Areas:</strong> What skills or knowledge do you need to develop? What limitations or biases did you discover in yourself?</p>

<h3>Application and Future Action</h3>
<p><strong>How will you apply this learning?</strong> Describe specific ways you'll use these insights in the future. What will you do differently? What goals will you set?</p>

<p><strong>Action Steps:</strong></p>
<ul>
  <li>Specific action 1</li>
  <li>Specific action 2</li>
  <li>Specific action 3</li>
</ul>

<h3>Conclusion</h3>
<p><strong>Summary:</strong> Briefly recap your main insights and their significance. What is the most important thing you're taking away from this reflection?</p>

<p><strong>Questions for Further Exploration:</strong></p>
<ul>
  <li>Question 1</li>
  <li>Question 2</li>
  <li>Question 3</li>
</ul>

<hr>

<p><em>Reflection Tips: Be honest and specific. Use "I" statements. Focus on what you learned, not just what happened. Consider both successes and challenges. Think critically about your assumptions and biases.</em></p>`
    };

    return templates[type] || '';
  };

  const handleAutocompleteRequest = async (currentText: string): Promise<string> => {
    // Strictly check token limit before making request
    if (!submissionId) {
      return '';
    }

    if (aiTokensUsed >= aiTokenLimit) {
      console.log('Token limit reached. Cannot request autocomplete.');
      return '';
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return '';
      }
      const idToken = await currentUser.getIdToken();

      const response = await fetch('/api/ai/autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          text: currentText,
          submissionId,
        }),
      });

      if (!response.ok) {
        return '';
      }

      const data = await response.json();
      if (data.success && data.suggestion) {
        // Update token usage
        if (data.tokensUsed !== undefined) {
          setAiTokensUsed(data.tokensUsed);
        }
        return data.suggestion;
      }

      return '';
    } catch (error) {
      console.error('Autocomplete error:', error);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-30 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
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
                // Navigate to clean canvas URL - this will trigger a full reload
                window.location.href = '/dashboard/canvas';
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
            <button
              onClick={saveContent}
              disabled={saving}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Click to save now"
            >
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
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  Click to save
                </>
              )}
            </button>

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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
                  {/* Assignment Type Badge */}
                  {assignmentType && (
                    <div className="mt-3 flex items-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {assignmentType}
                      </span>
                      <button
                        onClick={() => setShowTypeModal(true)}
                        className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                {/* Rich Text Editor - Scrollable */}
                <div className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style>{`.overflow-y-auto::-webkit-scrollbar { display: none; }`}</style>
                  <div className="max-w-4xl mx-auto w-full">
                    <RichTextEditor
                      content={content}
                      onChange={(newContent) => setContent(newContent)}
                      placeholder="Start writing your assignment here..."
                      autocompleteEnabled={autocompleteEnabled}
                      onAutocompleteRequest={handleAutocompleteRequest}
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
            <AIChat
              onInsert={insertFromChat}
              submissionId={submissionId}
              tokensUsed={aiTokensUsed}
              tokenLimit={aiTokenLimit}
              onTokenUpdate={setAiTokensUsed}
              assignmentTitle={assignment?.title || title}
              currentContent={content}
            />
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
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">AI Suggestions ({aiAssistance.length})</h3>
                    <button
                      onClick={() => setAiAssistance([])}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  </div>
                  {aiAssistance.map((suggestion, index) => (
                    <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
                          {suggestion.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round((suggestion.confidence || 0.85) * 100)}% confident
                        </span>
                      </div>
                      {suggestion.original && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Original:</p>
                          <p className="text-sm text-gray-700 italic bg-white px-2 py-1 rounded">"{suggestion.original}"</p>
                        </div>
                      )}
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Suggestion:</p>
                        <p className="text-sm text-gray-900 font-medium">{suggestion.suggestion}</p>
                      </div>
                      {(suggestion as any).explanation && (
                        <p className="text-xs text-gray-600 mb-3 italic">{(suggestion as any).explanation}</p>
                      )}
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => dismissSuggestion(suggestion)}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Dismiss
                        </button>
                        {suggestion.original && (
                          <button
                            onClick={() => applySuggestion(suggestion)}
                            className="px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded font-medium"
                          >
                            Apply Fix
                          </button>
                        )}
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

      {/* Assignment Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Assignment Type</h2>
              <p className="text-gray-600">Choose a template to start with a professional structure.</p>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Template List */}
              <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-6">
                <div className="space-y-3">
                  {[
                    { name: 'Essay', desc: 'Structured argument with introduction, body paragraphs, and conclusion' },
                    { name: 'Research Paper', desc: 'In-depth academic research with literature review and methodology' },
                    { name: 'Report', desc: 'Professional document with executive summary and recommendations' },
                    { name: 'Case Study Response', desc: 'Analysis of a specific situation with problem-solving approach' },
                    { name: 'Literature Review', desc: 'Comprehensive survey and synthesis of existing research' },
                    { name: 'Annotated Bibliography', desc: 'List of sources with summaries and evaluations' },
                    { name: 'Reflective Writing/Journal', desc: 'Personal reflection on experiences and learning' }
                  ].map((type) => (
                    <button
                      key={type.name}
                      onMouseEnter={() => setPreviewType(type.name)}
                      onClick={() => {
                        setAssignmentType(type.name as any);
                        // Apply template if content is empty or default
                        if (!content || content.trim() === '') {
                          const template = getTemplateForType(type.name);
                          setContent(template);
                        }
                        setShowTypeModal(false);
                        setPreviewType(null);
                      }}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:border-blue-500 hover:bg-blue-50 ${
                        previewType === type.name || assignmentType === type.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="font-medium text-gray-900 mb-1">{type.name}</div>
                      <div className="text-sm text-gray-600">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Panel */}
              <div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
                {previewType ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Preview</h3>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div dangerouslySetInnerHTML={{ __html: getTemplatePreview(previewType) }} />
                    </div>
                    <p className="text-sm text-gray-500 mt-4 italic">
                      Hover over different templates to see their structure. Click to select.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <div className="text-gray-400 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Hover over a template to preview its structure</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowTypeModal(false);
                  setPreviewType(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {assignmentType ? 'Cancel' : 'Skip for now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}