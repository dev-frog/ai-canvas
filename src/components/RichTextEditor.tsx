'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import { useEffect, useState, useRef } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  CodeBracketIcon,
  MinusIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import 'katex/dist/katex.min.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onKeyDown?: (e: any) => void;
  placeholder?: string;
  autocompleteEnabled?: boolean;
  onAutocompleteRequest?: (text: string) => Promise<string>;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [showMathInput, setShowMathInput] = useState(false);
  const [mathExpression, setMathExpression] = useState('');

  if (!editor) {
    return null;
  }

  const addMathExpression = () => {
    if (mathExpression) {
      editor.chain().focus().insertContent(`$$${mathExpression}$$`).run();
      setMathExpression('');
      setShowMathInput(false);
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
      {/* Heading Styles */}
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-3 py-1 text-sm rounded ${
            editor.isActive('paragraph') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 text-sm font-bold rounded ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 text-sm font-bold rounded ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 text-sm font-bold rounded ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          H3
        </button>
      </div>

      {/* Text Formatting */}
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${
            editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Bold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${
            editor.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Italic"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h8M8 20h8M14 4L10 20" />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded ${
            editor.isActive('strike') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Strikethrough"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M8 6h12a2 2 0 0 1 0 4H8M7 18h10a2 2 0 0 0 0-4H7" />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded ${
            editor.isActive('code') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Code"
        >
          <CodeBracketIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${
            editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Bullet List"
        >
          <ListBulletIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${
            editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h2M3 9h2M3 14h2M3 19h2M8 4h13M8 9h13M8 14h13M8 19h13" />
          </svg>
        </button>
      </div>

      {/* Alignment */}
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Align Left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h12M3 18h18" />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Align Center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M6 12h12M3 18h18" />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Align Right"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M9 12h12M3 18h18" />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded ${
            editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Justify"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* Link & Math */}
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          onClick={setLink}
          className={`p-2 rounded ${
            editor.isActive('link') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowMathInput(!showMathInput)}
          className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
          title="Insert Math Expression"
        >
          <span className="text-sm font-bold">∑</span>
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
          title="Horizontal Rule"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <ArrowUturnLeftIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <ArrowUturnRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Math Input */}
      {showMathInput && (
        <div className="absolute mt-2 top-14 left-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">LaTeX Math Expression:</label>
            <input
              type="text"
              value={mathExpression}
              onChange={(e) => setMathExpression(e.target.value)}
              placeholder="e.g., x^2 + y^2 = z^2"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              onKeyPress={(e) => e.key === 'Enter' && addMathExpression()}
            />
            <div className="flex gap-2">
              <button
                onClick={addMathExpression}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Insert
              </button>
              <button
                onClick={() => setShowMathInput(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use LaTeX syntax. Examples: x^2, \frac{"{a}{b}"}, \sqrt{"{x}"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function RichTextEditor({ content, onChange, onKeyDown, placeholder, autocompleteEnabled, onAutocompleteRequest }: RichTextEditorProps) {
  const [autocompleteSuggestion, setAutocompleteSuggestion] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      // Auto-refresh removed - suggestions now triggered manually only
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px]',
      },
      handleKeyDown: (view, event) => {
        // Accept suggestion with Tab key
        if (event.key === 'Tab' && autocompleteSuggestion && autocompleteEnabled) {
          event.preventDefault();
          const { state } = view;
          const { from } = state.selection;
          const textBefore = state.doc.textBetween(Math.max(0, from - 1), from);
          const needsSpace = textBefore && textBefore !== ' ' && textBefore !== '\n';
          const trimmedSuggestion = autocompleteSuggestion.trimStart();
          const contentToInsert = needsSpace ? ' ' + trimmedSuggestion : trimmedSuggestion;
          editor?.commands.insertContent(contentToInsert);
          setAutocompleteSuggestion('');
          return true;
        }
        // Clear suggestion on Escape
        if (event.key === 'Escape' && autocompleteSuggestion) {
          event.preventDefault();
          setAutocompleteSuggestion('');
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Manual trigger for autocomplete
  const handleManualSuggestion = async () => {
    if (!autocompleteEnabled || !onAutocompleteRequest || !editor) return;

    const fullText = editor.getText();
    if (fullText.length < 50) return;

    setIsLoadingSuggestion(true);
    try {
      const { from } = editor.state.selection;
      const textBeforeCursor = fullText.substring(Math.max(0, from - 300), from);
      const textAfterCursor = fullText.substring(from, Math.min(fullText.length, from + 100));
      const contextText = textBeforeCursor + '|CURSOR|' + textAfterCursor;
      const suggestion = await onAutocompleteRequest(contextText);
      setAutocompleteSuggestion(suggestion);
    } catch (error) {
      console.error('Autocomplete error:', error);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  useEffect(() => {
    // Render math expressions after editor updates
    const renderMath = async () => {
      if (typeof window !== 'undefined') {
        const katex = (await import('katex')).default;
        const mathElements = document.querySelectorAll('.ProseMirror');
        mathElements.forEach((element) => {
          const html = element.innerHTML;
          // Replace inline math $$...$$ with rendered KaTeX
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
          if (html !== rendered) {
            element.innerHTML = rendered;
          }
        });
      }
    };

    const timer = setTimeout(renderMath, 100);
    return () => clearTimeout(timer);
  }, [editor?.state.doc]);

  return (
    <div className="flex flex-col">
      <MenuBar editor={editor} />
      <div className="px-12 py-6 relative">
        <EditorContent editor={editor} className="math-content prose prose-lg max-w-none focus:outline-none" />

        {/* Manual Suggestion Button */}
        {autocompleteEnabled && !autocompleteSuggestion && !isLoadingSuggestion && (
          <button
            onClick={handleManualSuggestion}
            className="fixed bottom-8 right-8 flex items-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all z-50 animate-fadeIn"
            title="Get AI writing suggestion"
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Get Suggestion</span>
          </button>
        )}

        {/* Autocomplete Suggestion */}
        {autocompleteEnabled && autocompleteSuggestion && (
          <div className="fixed bottom-8 right-8 max-w-md bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg shadow-lg p-4 z-50 animate-fadeIn">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <SparklesIcon className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-xs font-semibold text-gray-700">AI Suggestion</span>
              </div>
              <button
                onClick={() => setAutocompleteSuggestion('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-700 mb-3">{autocompleteSuggestion}</p>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Tab</kbd> to accept
              </div>
              <button
                onClick={() => {
                  if (editor) {
                    const { state } = editor.view;
                    const { from } = state.selection;
                    const textBefore = state.doc.textBetween(Math.max(0, from - 1), from);
                    const needsSpace = textBefore && textBefore !== ' ' && textBefore !== '\n';
                    const trimmedSuggestion = autocompleteSuggestion.trimStart();
                    const contentToInsert = needsSpace ? ' ' + trimmedSuggestion : trimmedSuggestion;
                    editor.commands.insertContent(contentToInsert);
                    setAutocompleteSuggestion('');
                  }
                }}
                className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
              >
                Insert
              </button>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {autocompleteEnabled && isLoadingSuggestion && (
          <div className="fixed bottom-8 right-8 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
            <div className="flex items-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              Getting AI suggestion...
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
