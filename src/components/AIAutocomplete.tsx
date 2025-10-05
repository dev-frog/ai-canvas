'use client';

import { useState, useEffect } from 'react';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AIAutocompleteProps {
  onAccept: (text: string) => void;
  onReject: () => void;
  suggestion: string;
  position: { top: number; left: number };
}

export default function AIAutocomplete({ onAccept, onReject, suggestion, position }: AIAutocompleteProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        onAccept(suggestion);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onReject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestion, onAccept, onReject]);

  if (!isVisible || !suggestion) return null;

  return (
    <div
      className="absolute z-50 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg shadow-lg p-4 max-w-2xl"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center text-purple-700 font-medium text-sm">
          <SparklesIcon className="h-4 w-4 mr-2 animate-pulse" />
          AI Suggestion
        </div>
        <button
          onClick={onReject}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="text-gray-700 mb-3 italic">
        {suggestion}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex gap-4">
          <span className="flex items-center">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Tab</kbd>
            <span className="ml-1">to accept</span>
          </span>
          <span className="flex items-center">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Esc</kbd>
            <span className="ml-1">to dismiss</span>
          </span>
        </div>
        <button
          onClick={() => onAccept(suggestion)}
          className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs font-medium"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
