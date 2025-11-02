'use client';

import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { passwordsMatch } from '@/lib/validation/passwordValidation';

interface PasswordMatchIndicatorProps {
  password: string;
  confirmPassword: string;
}

const PasswordMatchIndicator: React.FC<PasswordMatchIndicatorProps> = ({
  password,
  confirmPassword,
}) => {
  if (!confirmPassword) {
    return null;
  }

  const isMatch = passwordsMatch(password, confirmPassword);

  return (
    <div
      className={`mt-2 flex items-center text-sm ${
        isMatch ? 'text-green-700' : 'text-red-700'
      }`}
      role="alert"
      aria-live="polite"
    >
      {isMatch ? (
        <>
          <CheckCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
          <span className="font-medium">Passwords match</span>
        </>
      ) : (
        <>
          <XCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
          <span className="font-medium">Passwords do not match</span>
        </>
      )}
    </div>
  );
};

export default PasswordMatchIndicator;
