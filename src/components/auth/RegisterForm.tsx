'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { AlertCircle, User, GraduationCap } from 'lucide-react';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import PasswordMatchIndicator from './PasswordMatchIndicator';
import { validatePassword, passwordsMatch } from '@/lib/validation/passwordValidation';

const RegisterForm: React.FC = () => {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'student';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const { register } = useAuth();
  const router = useRouter();

  // Memoize password validation to avoid unnecessary recalculations
  const passwordValidation = useMemo(
    () => validatePassword(formData.password),
    [formData.password]
  );

  const doPasswordsMatch = useMemo(
    () => passwordsMatch(formData.password, formData.confirmPassword),
    [formData.password, formData.confirmPassword]
  );

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      passwordValidation.isValid &&
      doPasswordsMatch
    );
  }, [formData.name, formData.email, passwordValidation.isValid, doPasswordsMatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (field: 'password' | 'confirmPassword') => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mark all fields as touched to show validation errors
    setTouched({
      password: true,
      confirmPassword: true,
    });

    // Validate password strength
    if (!passwordValidation.isValid) {
      setError('Password does not meet all security requirements');
      return;
    }

    // Validate password match
    if (!doPasswordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email, formData.password, formData.name, formData.role);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">
            Join AI Assignment Canvas today
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Input
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                formData.role === 'student'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 bg-white'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex flex-col items-center text-center">
                  <GraduationCap className={`h-6 w-6 ${
                    formData.role === 'student' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className={`mt-2 text-sm font-medium ${
                    formData.role === 'student' ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    Student
                  </span>
                </div>
              </label>

              <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                formData.role === 'teacher'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 bg-white'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={formData.role === 'teacher'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex flex-col items-center text-center">
                  <User className={`h-6 w-6 ${
                    formData.role === 'teacher' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className={`mt-2 text-sm font-medium ${
                    formData.role === 'teacher' ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    Teacher
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              required
              placeholder="Create a strong password"
              aria-describedby="password-requirements"
            />
            <div id="password-requirements">
              <PasswordStrengthIndicator password={formData.password} showRules={touched.password || formData.password.length > 0} />
            </div>
          </div>

          <div>
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              required
              placeholder="Confirm your password"
              aria-describedby="password-match"
            />
            <div id="password-match">
              <PasswordMatchIndicator
                password={formData.password}
                confirmPassword={formData.confirmPassword}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900 cursor-pointer">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={!isFormValid || isLoading}
            title={!isFormValid ? 'Please complete all required fields and meet password requirements' : ''}
          >
            Create Account
          </Button>

          {!isFormValid && (formData.name || formData.email || formData.password || formData.confirmPassword) && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Complete all requirements above to create your account
            </p>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;