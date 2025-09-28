'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import PublicFooter from '@/components/layout/PublicFooter';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  BookOpenIcon,
  AcademicCapIcon,
  CogIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const faqCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: BookOpenIcon,
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Get Started" button on our homepage, then fill out the registration form with your email, name, and choose your role (student, teacher, or admin). You\'ll receive a confirmation email to verify your account.'
      },
      {
        question: 'What is the difference between student and teacher accounts?',
        answer: 'Student accounts are designed for writing assignments and getting AI assistance. Teacher accounts can create assignments, manage classes, grade submissions, and access analytics. Both have different AI token limits and features.'
      },
      {
        question: 'How do I join a class?',
        answer: 'If you\'re a student, ask your teacher for a class code. Then go to your dashboard and click "Join Class" to enter the code. Teachers can invite students directly via email or share the class code.'
      }
    ]
  },
  {
    id: 'ai-assistance',
    name: 'AI Assistance',
    icon: AcademicCapIcon,
    questions: [
      {
        question: 'What are AI tokens and how do they work?',
        answer: 'AI tokens represent the computational resources used when our AI helps with your writing. Each suggestion, grammar check, or citation generation uses tokens. Free accounts get 1,000 tokens monthly, while Pro accounts get more.'
      },
      {
        question: 'How can AI help with my writing?',
        answer: 'Our AI can help with grammar and spelling, suggest improvements to style and clarity, generate citations, check for plagiarism, and provide writing suggestions while maintaining your original voice and ideas.'
      },
      {
        question: 'Is my work private and secure?',
        answer: 'Yes, your work is private and secure. We use encryption to protect your data, and we never share your academic work with third parties. You maintain full ownership of your content.'
      }
    ]
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions & Billing',
    icon: CreditCardIcon,
    questions: [
      {
        question: 'What subscription plans do you offer?',
        answer: 'We offer a Free plan with basic features, Pro Monthly ($19.99/month) with advanced features, and Pro Yearly ($199.99/year) with premium features and the best value.'
      },
      {
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes, you can cancel your subscription at any time. Your access to Pro features will continue until the end of your current billing period, then you\'ll be moved to the free plan.'
      },
      {
        question: 'Do you offer educational discounts?',
        answer: 'Yes! We offer special pricing for educational institutions. Contact our sales team to learn about bulk licensing and educational discounts for schools and universities.'
      }
    ]
  },
  {
    id: 'technical',
    name: 'Technical Support',
    icon: CogIcon,
    questions: [
      {
        question: 'What browsers are supported?',
        answer: 'AI Canvas works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.'
      },
      {
        question: 'My work isn\'t saving automatically. What should I do?',
        answer: 'Check your internet connection and browser settings. Auto-save requires a stable connection. You can also manually save your work using Ctrl+S (Cmd+S on Mac). If issues persist, contact support.'
      },
      {
        question: 'How do I export my assignments?',
        answer: 'Pro users can export assignments in multiple formats (PDF, Word, etc.) from the assignment page. Click the "Export" button and choose your preferred format.'
      }
    ]
  }
];

const quickLinks = [
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step guides',
    href: '#tutorials',
    icon: '🎥'
  },
  {
    title: 'User Guide',
    description: 'Complete documentation',
    href: '#user-guide',
    icon: '📖'
  },
  {
    title: 'Community Forum',
    description: 'Connect with other users',
    href: '#community',
    icon: '💬'
  },
  {
    title: 'Contact Support',
    description: 'Get personalized help',
    href: '/contact',
    icon: '📧'
  }
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  const toggleQuestion = (questionIndex: string) => {
    setExpandedQuestions(prev =>
      prev.includes(questionIndex)
        ? prev.filter(q => q !== questionIndex)
        : [...prev, questionIndex]
    );
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Find answers to common questions, learn how to use AI Canvas effectively,
            and get the support you need.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-3">{link.icon}</div>
              <h3 className="font-medium text-gray-900 mb-2">{link.title}</h3>
              <p className="text-sm text-gray-600">{link.description}</p>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Navigation */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Categories</h2>
            <nav className="space-y-2">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`${
                    activeCategory === category.id
                      ? 'bg-blue-50 text-blue-700 border-blue-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
                  } w-full text-left flex items-center px-3 py-2 border-l-4 text-sm font-medium transition-colors`}
                >
                  <category.icon className="h-5 w-5 mr-3" />
                  {category.name}
                </button>
              ))}
            </nav>

            {/* Contact Support */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Need More Help?</h3>
              <p className="text-sm text-blue-700 mb-3">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                Contact Support
              </a>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {searchTerm ? (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Search Results for "{searchTerm}"
                </h2>
                {filteredCategories.length > 0 ? (
                  <div className="space-y-8">
                    {filteredCategories.map((category) => (
                      <div key={category.id}>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <category.icon className="h-5 w-5 mr-2" />
                          {category.name}
                        </h3>
                        <div className="space-y-4">
                          {category.questions.map((faq, index) => {
                            const questionId = `${category.id}-${index}`;
                            const isExpanded = expandedQuestions.includes(questionId);

                            return (
                              <div key={index} className="border border-gray-200 rounded-lg">
                                <button
                                  onClick={() => toggleQuestion(questionId)}
                                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                                >
                                  <span className="font-medium text-gray-900">{faq.question}</span>
                                  <ChevronDownIcon
                                    className={`h-5 w-5 text-gray-500 transition-transform ${
                                      isExpanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>
                                {isExpanded && (
                                  <div className="px-6 pb-4">
                                    <p className="text-gray-700">{faq.answer}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <QuestionMarkCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600">
                      Try different keywords or browse our categories below.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {(() => {
                  const category = faqCategories.find(c => c.id === activeCategory);
                  if (!category) return null;

                  return (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <category.icon className="h-6 w-6 mr-3" />
                        {category.name}
                      </h2>
                      <div className="space-y-4">
                        {category.questions.map((faq, index) => {
                          const questionId = `${category.id}-${index}`;
                          const isExpanded = expandedQuestions.includes(questionId);

                          return (
                            <div key={index} className="border border-gray-200 rounded-lg">
                              <button
                                onClick={() => toggleQuestion(questionId)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                              >
                                <span className="font-medium text-gray-900">{faq.question}</span>
                                <ChevronDownIcon
                                  className={`h-5 w-5 text-gray-500 transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                              {isExpanded && (
                                <div className="px-6 pb-4">
                                  <p className="text-gray-700">{faq.answer}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🎓</div>
              <h3 className="font-medium text-gray-900 mb-2">Academic Writing Guide</h3>
              <p className="text-gray-600 text-sm mb-3">
                Learn best practices for academic writing and how to use AI assistance effectively.
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                Read Guide →
              </a>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="font-medium text-gray-900 mb-2">API Documentation</h3>
              <p className="text-gray-600 text-sm mb-3">
                For developers: integrate AI Canvas into your applications.
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                View Docs →
              </a>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-medium text-gray-900 mb-2">System Status</h3>
              <p className="text-gray-600 text-sm mb-3">
                Check the current status of our services and any ongoing issues.
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                Check Status →
              </a>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}