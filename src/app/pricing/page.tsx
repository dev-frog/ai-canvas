'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import PublicFooter from '@/components/layout/PublicFooter';
import {
  CheckIcon,
  XMarkIcon,
  StarIcon,
  BoltIcon,
  AcademicCapIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    description: 'Perfect for getting started with AI-powered writing assistance',
    popular: false,
    features: [
      '1,000 AI tokens per month',
      'Basic grammar and spell check',
      'Simple citation generator',
      'Up to 3 assignments',
      'Community support',
      'Export to PDF',
    ],
    limitations: [
      'Limited AI assistance',
      'No plagiarism detection',
      'No advanced analytics',
      'No priority support'
    ],
    cta: 'Get Started Free',
    ctaLink: '/auth/register'
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: 19.99,
    interval: 'month',
    description: 'Advanced features for serious students and educators',
    popular: true,
    features: [
      '10,000 AI tokens per month',
      'Advanced writing suggestions',
      'Full citation library (APA, MLA, Harvard, Chicago)',
      'Unlimited assignments',
      'Plagiarism detection',
      'Writing analytics',
      'Priority support',
      'Export to multiple formats',
      'Class management (teachers)',
      'Grading assistance'
    ],
    limitations: [],
    cta: 'Start Pro Trial',
    ctaLink: '/auth/register?plan=monthly'
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 199.99,
    originalPrice: 239.88,
    interval: 'year',
    description: 'Best value for long-term users - save 17%',
    popular: false,
    features: [
      '15,000 AI tokens per month',
      'Everything in Pro Monthly',
      'Advanced analytics dashboard',
      'Custom citation styles',
      'Bulk assignment management',
      'API access',
      'White-label options',
      'Dedicated account manager',
      'Early access to new features',
      'Integration support'
    ],
    limitations: [],
    cta: 'Choose Yearly',
    ctaLink: '/auth/register?plan=yearly'
  }
];

const faqItems = [
  {
    question: "What are AI tokens?",
    answer: "AI tokens represent the computational resources used when our AI assists with your writing. Each suggestion, grammar check, or citation generation uses tokens. Think of them as your monthly allowance for AI assistance."
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Yes! You can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period. We'll prorate any billing differences."
  },
  {
    question: "Is there a free trial for Pro plans?",
    answer: "Yes! New users get a 14-day free trial of Pro features when they sign up. No credit card required for the free plan, and you can upgrade to Pro anytime during your trial."
  },
  {
    question: "Do you offer educational discounts?",
    answer: "Absolutely! We offer special pricing for educational institutions, including bulk licensing and custom features. Contact our sales team to learn about educational discounts."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for yearly plans. All payments are processed securely through Stripe."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your Pro features will remain active until the end of your current billing period, then you'll automatically switch to the free plan."
  }
];

const enterpriseFeatures = [
  'Custom AI token limits',
  'Dedicated infrastructure',
  'Advanced security & compliance',
  'Single Sign-On (SSO)',
  'Custom integrations',
  'Priority implementation support',
  'Service Level Agreements (SLA)',
  'Custom training & onboarding'
];

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredPlans = plans.filter(plan =>
    plan.id === 'free' ||
    (billingInterval === 'monthly' && plan.id === 'monthly') ||
    (billingInterval === 'yearly' && plan.id === 'yearly')
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Choose the plan that fits your needs. Start free and upgrade as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${billingInterval === 'monthly' ? 'text-white' : 'text-blue-200'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-white bg-opacity-20 transition-colors duration-200 ease-in-out"
            >
              <span
                className={`${
                  billingInterval === 'yearly' ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
            <span className={`ml-3 ${billingInterval === 'yearly' ? 'text-white' : 'text-blue-200'}`}>
              Yearly
            </span>
            {billingInterval === 'yearly' && (
              <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className={`${
                plan.popular
                  ? 'ring-2 ring-blue-500 scale-105 bg-blue-50'
                  : 'ring-1 ring-gray-300 bg-white'
              } relative rounded-lg shadow-lg overflow-hidden`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                  <StarIcon className="h-4 w-4 inline mr-1" />
                  Most Popular
                </div>
              )}

              <div className={`px-6 ${plan.popular ? 'pt-12 pb-8' : 'py-8'}`}>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 mt-2">{plan.description}</p>

                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-1">/{plan.interval}</span>
                    )}
                  </div>
                  {plan.originalPrice && (
                    <div className="mt-1">
                      <span className="text-sm text-gray-500 line-through">
                        ${plan.originalPrice}/{plan.interval}
                      </span>
                      <span className="ml-2 text-sm text-green-600 font-medium">
                        Save ${(plan.originalPrice - plan.price).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <a
                  href={plan.ctaLink}
                  className={`mt-8 w-full block text-center py-3 px-4 rounded-md font-medium transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.price === 0
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </a>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-3">Not included:</p>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start">
                          <XMarkIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-500 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Section */}
        <div className="bg-gray-900 text-white rounded-lg p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Enterprise Solutions</h2>
              <p className="text-gray-300 mb-6">
                Custom solutions for large educational institutions, universities, and organizations
                with advanced requirements.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enterpriseFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center lg:text-right">
              <div className="mb-4">
                <UsersIcon className="h-12 w-12 text-blue-400 mx-auto lg:mx-0" />
              </div>
              <h3 className="text-xl font-bold mb-2">Custom Pricing</h3>
              <p className="text-gray-300 mb-6">
                Tailored solutions based on your specific needs and usage requirements.
              </p>
              <div className="space-y-3">
                <a
                  href="/contact"
                  className="block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Contact Sales
                </a>
                <a
                  href="/contact"
                  className="block border border-gray-600 text-gray-300 px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
                >
                  Schedule Demo
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            {faqItems.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg mb-4">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Improve Your Academic Writing?
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of students and educators who trust AI Canvas for their academic success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Free Today
            </a>
            <a
              href="/features"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Explore Features
            </a>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}