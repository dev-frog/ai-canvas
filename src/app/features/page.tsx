'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import PublicFooter from '@/components/layout/PublicFooter';
import {
  PencilSquareIcon,
  BookOpenIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  AcademicCapIcon,
  UsersIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const mainFeatures = [
  {
    icon: PencilSquareIcon,
    title: 'AI-Powered Writing Assistant',
    description: 'Get intelligent suggestions for grammar, style, clarity, and academic tone while maintaining your unique voice.',
    benefits: ['Real-time grammar checking', 'Style and tone optimization', 'Academic writing guidance', 'Contextual suggestions']
  },
  {
    icon: BookOpenIcon,
    title: 'Smart Citation Generator',
    description: 'Automatically generate properly formatted citations in APA, MLA, Harvard, Chicago, and other academic styles.',
    benefits: ['Multiple citation styles', 'Automatic formatting', 'Source verification', 'Bibliography creation']
  },
  {
    icon: ChartBarIcon,
    title: 'Writing Analytics',
    description: 'Track your writing progress, AI usage, and improvement over time with detailed analytics and insights.',
    benefits: ['Progress tracking', 'AI usage statistics', 'Writing improvement metrics', 'Performance insights']
  },
  {
    icon: ShieldCheckIcon,
    title: 'Plagiarism Detection',
    description: 'Ensure academic integrity with built-in plagiarism checking and originality scoring.',
    benefits: ['Real-time plagiarism checking', 'Originality scoring', 'Source identification', 'Academic integrity tools']
  }
];

const additionalFeatures = [
  {
    icon: UsersIcon,
    title: 'Class Management',
    description: 'Teachers can create classes, manage students, and track assignment submissions.',
    userType: 'Teachers'
  },
  {
    icon: DocumentTextIcon,
    title: 'Assignment Templates',
    description: 'Pre-built templates for essays, research papers, lab reports, and more.',
    userType: 'All Users'
  },
  {
    icon: MagnifyingGlassIcon,
    title: 'Research Assistant',
    description: 'AI-powered research suggestions and source recommendations.',
    userType: 'Pro Users'
  },
  {
    icon: ClockIcon,
    title: 'Auto-Save & Version History',
    description: 'Never lose your work with automatic saving and complete version history.',
    userType: 'All Users'
  },
  {
    icon: CheckCircleIcon,
    title: 'Grading & Feedback',
    description: 'Streamlined grading tools with AI-assisted feedback suggestions.',
    userType: 'Teachers'
  },
  {
    icon: BoltIcon,
    title: 'Export & Integration',
    description: 'Export to Word, PDF, Google Docs, and integrate with popular platforms.',
    userType: 'Pro Users'
  }
];

const useCases = [
  {
    title: 'For Students',
    icon: AcademicCapIcon,
    description: 'Write better essays, research papers, and assignments with AI guidance.',
    features: [
      'Writing assistance and suggestions',
      'Citation generation and formatting',
      'Plagiarism checking and prevention',
      'Grammar and style improvements',
      'Assignment templates and guides'
    ]
  },
  {
    title: 'For Teachers',
    icon: UsersIcon,
    description: 'Manage classes, create assignments, and provide better feedback.',
    features: [
      'Class and student management',
      'Assignment creation and distribution',
      'AI-assisted grading and feedback',
      'Writing analytics and progress tracking',
      'Academic integrity monitoring'
    ]
  },
  {
    title: 'For Institutions',
    icon: BookOpenIcon,
    description: 'Scale academic writing support across your entire institution.',
    features: [
      'Bulk user management',
      'Institution-wide analytics',
      'Custom citation styles',
      'White-label options',
      'API access and integrations'
    ]
  }
];

const comparisonTable = [
  { feature: 'AI Writing Assistance', free: true, pro: true, note: 'Limited tokens on free plan' },
  { feature: 'Basic Citation Styles', free: true, pro: true, note: '' },
  { feature: 'Grammar & Spell Check', free: true, pro: true, note: '' },
  { feature: 'Plagiarism Detection', free: false, pro: true, note: 'Pro feature' },
  { feature: 'Advanced Analytics', free: false, pro: true, note: 'Pro feature' },
  { feature: 'Export Options', free: false, pro: true, note: 'PDF, Word, etc.' },
  { feature: 'Priority Support', free: false, pro: true, note: '24/7 support' },
  { feature: 'API Access', free: false, pro: true, note: 'Yearly plan only' }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features for Academic Excellence
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Discover how AI Canvas transforms the way students write, teachers grade, and institutions manage academic content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/pricing"
              className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Main Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to excel in academic writing, powered by advanced AI technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Features</h2>
            <p className="text-lg text-gray-600">
              Comprehensive tools designed for every aspect of academic writing and management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <feature.icon className="h-5 w-5 text-blue-600 mr-3" />
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {feature.userType}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Everyone</h2>
            <p className="text-lg text-gray-600">
              Tailored features for students, teachers, and educational institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <useCase.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                  <p className="text-gray-600">{useCase.description}</p>
                </div>
                <ul className="space-y-3">
                  {useCase.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Feature Comparison</h2>
            <p className="text-lg text-gray-600">
              See what's included in each plan and find the right fit for your needs.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Free
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparisonTable.map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {row.free ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {row.pro ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Writing?</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of students and educators who are already using AI Canvas to improve their academic writing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/contact"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Request Demo
            </a>
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
}