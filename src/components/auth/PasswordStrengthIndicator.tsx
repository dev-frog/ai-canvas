'use client';

import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import {
  validatePassword,
  getStrengthColor,
  getStrengthTextColor,
  type PasswordValidation,
} from '@/lib/validation/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRules?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRules = true,
}) => {
  const validation: PasswordValidation = validatePassword(password);

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Password Strength</span>
          <span className={`text-xs font-semibold ${getStrengthTextColor(validation.strength)} capitalize`}>
            {validation.strength}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(validation.strength)}`}
            style={{ width: `${validation.score}%` }}
            role="progressbar"
            aria-valuenow={validation.score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Password strength: ${validation.strength}`}
          />
        </div>
      </div>

      {/* Validation Rules */}
      {showRules && (
        <div className="space-y-2" role="list" aria-label="Password requirements">
          {validation.rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center text-xs"
              role="listitem"
              aria-label={`${rule.label}: ${rule.met ? 'met' : 'not met'}`}
            >
              {rule.met ? (
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" aria-hidden="true" />
              ) : (
                <XCircleIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true" />
              )}
              <span className={rule.met ? 'text-green-700 font-medium' : 'text-gray-600'}>
                {rule.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
