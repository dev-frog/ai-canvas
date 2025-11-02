export interface PasswordValidationRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export interface PasswordValidation {
  rules: PasswordValidationRule[];
  isValid: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
}

/**
 * Validates password against security requirements
 * @param password - The password to validate
 * @returns PasswordValidation object with rules and strength
 */
export function validatePassword(password: string): PasswordValidation {
  const rules: PasswordValidationRule[] = [
    {
      id: 'minLength',
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8,
      met: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter (A-Z)',
      test: (pwd) => /[A-Z]/.test(pwd),
      met: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter (a-z)',
      test: (pwd) => /[a-z]/.test(pwd),
      met: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'One number (0-9)',
      test: (pwd) => /[0-9]/.test(pwd),
      met: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'One special character (!@#$%^&*)',
      test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  const metCount = rules.filter((rule) => rule.met).length;
  const isValid = metCount === rules.length;

  // Calculate strength based on rules met
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (metCount <= 2) {
    strength = 'weak';
  } else if (metCount === 3) {
    strength = 'fair';
  } else if (metCount === 4) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  // Calculate score (0-100)
  const score = Math.round((metCount / rules.length) * 100);

  return {
    rules,
    isValid,
    strength,
    score,
  };
}

/**
 * Checks if two passwords match
 * @param password - The original password
 * @param confirmPassword - The confirmation password
 * @returns true if passwords match and are not empty
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
}

/**
 * Gets color class for password strength
 * @param strength - The password strength level
 * @returns Tailwind color class
 */
export function getStrengthColor(strength: 'weak' | 'fair' | 'good' | 'strong'): string {
  const colors = {
    weak: 'bg-red-500',
    fair: 'bg-yellow-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500',
  };
  return colors[strength];
}

/**
 * Gets text color class for password strength
 * @param strength - The password strength level
 * @returns Tailwind text color class
 */
export function getStrengthTextColor(strength: 'weak' | 'fair' | 'good' | 'strong'): string {
  const colors = {
    weak: 'text-red-700',
    fair: 'text-yellow-700',
    good: 'text-blue-700',
    strong: 'text-green-700',
  };
  return colors[strength];
}
