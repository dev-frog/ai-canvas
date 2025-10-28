'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import {
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
  StarIcon,
  BoltIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  popular?: boolean;
  stripeId?: string;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    description: 'Perfect for getting started with AI-powered writing assistance',
    features: [
      '1,000 AI tokens per month',
      'Basic grammar and spell check',
      'Simple citation generator',
      'Up to 3 assignments',
      'Community support'
    ]
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: 10.00,
    interval: 'month',
    description: 'Advanced features for serious students and educators',
    popular: true,
    stripeId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_1QYourMonthlyPriceId',
    features: [
      '10,000 AI tokens per month',
      'Advanced writing suggestions',
      'Full citation library (APA, MLA, Harvard, Chicago)',
      'Unlimited assignments',
      'Plagiarism detection',
      'Writing analytics',
      'Priority support',
      'Export to multiple formats'
    ]
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 100.00,
    interval: 'year',
    description: 'Best value for long-term users - save 17%',
    stripeId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_1QYourYearlyPriceId',
    features: [
      '15,000 AI tokens per month',
      'Everything in Pro Monthly',
      'Advanced analytics dashboard',
      'Custom citation styles',
      'Bulk assignment management',
      'API access',
      'White-label options',
      'Dedicated account manager'
    ]
  }
];

export default function SubscriptionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user || !plan.stripeId) return;

    setProcessingPlan(plan.id);
    try {
      // Get Firebase ID token for authentication
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const idToken = await currentUser.getIdToken();

      // Create Stripe checkout session
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          priceId: plan.stripeId,
          userId: user._id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      // Show error message
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md z-50';
      errorMsg.textContent = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 3000);
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to access customer portal:', error);
    }
  };

  const handleSyncSubscription = async () => {
    setSyncing(true);
    try {
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch('/api/subscription/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Reload user data
        const updatedUser = await getCurrentUser();
        if (updatedUser) {
          setUser(updatedUser);
        }

        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md z-50';
        successMsg.textContent = data.message || 'Subscription synced successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => document.body.removeChild(successMsg), 3000);
      } else {
        throw new Error(data.error || 'Failed to sync subscription');
      }
    } catch (error) {
      console.error('Failed to sync subscription:', error);
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md z-50';
      errorMsg.textContent = error instanceof Error ? error.message : 'Failed to sync subscription';
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const getCurrentPlanFeatures = () => {
    if (!user) return [];

    switch (user.subscriptionTier) {
      case 'monthly':
        return plans.find(p => p.id === 'monthly')?.features || [];
      case 'yearly':
        return plans.find(p => p.id === 'yearly')?.features || [];
      default:
        return plans.find(p => p.id === 'free')?.features || [];
    }
  };

  const getUsagePercentage = () => {
    if (!user) return 0;
    return Math.round((user.aiTokensUsed / user.aiTokensLimit) * 100);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Unlock the full potential of AI-powered academic writing with our premium features
        </p>
      </div>

      {/* Current Usage */}
      {user && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Current Plan</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                {user.subscriptionTier || 'free'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Monthly AI Tokens</h3>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-900">{user.aiTokensUsed.toLocaleString()}</span>
                    <span className="text-gray-600">/ {user.aiTokensLimit.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        getUsagePercentage() >= 90 ? 'bg-red-500' :
                        getUsagePercentage() >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getUsagePercentage()}% used • {(user.aiTokensLimit - user.aiTokensUsed).toLocaleString()} remaining
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Subscription Status</h3>
                <p className="text-lg font-medium text-gray-900 capitalize mt-1">
                  {user.subscriptionStatus || 'Free'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {user.subscriptionTier === 'free' ? 'No billing' : 'Auto-renews monthly'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Quick Actions</h3>
                <div className="mt-2 space-y-2">
                  {user.subscriptionTier !== 'free' ? (
                    <button
                      onClick={handleManageSubscription}
                      className="block text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      Manage Subscription →
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">Upgrade to access premium features</p>
                  )}
                  <button
                    onClick={handleSyncSubscription}
                    disabled={syncing}
                    className="flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Subscription'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Token Usage Explanation */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm p-6 mb-8 border border-blue-100">
            <div className="flex items-start">
              <BoltIcon className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Understanding AI Token Usage</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>Account-level tokens:</strong> The {user.aiTokensLimit.toLocaleString()} tokens shown above are your monthly quota across all assignments. You've used {user.aiTokensUsed.toLocaleString()} tokens this month.
                  </p>
                  <p>
                    <strong>Per-assignment limits:</strong> Each individual assignment has a 1,000 token limit to encourage balanced AI use across your work. This prevents using all monthly tokens on a single assignment.
                  </p>
                  <p className="text-xs text-gray-600 italic mt-3">
                    💡 Tip: Token consumption varies by feature. AI Chat uses more tokens than quick grammar checks. Plan your usage accordingly!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${
              plan.popular
                ? 'ring-2 ring-blue-500 scale-105'
                : 'ring-1 ring-gray-300'
            } relative bg-white rounded-lg shadow-md overflow-hidden`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                Most Popular
              </div>
            )}

            <div className={`px-6 ${plan.popular ? 'pt-12 pb-6' : 'py-6'}`}>
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-gray-600 text-sm mt-2">{plan.description}</p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                {plan.price > 0 && (
                  <span className="text-gray-600">/{plan.interval}</span>
                )}
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {user?.subscriptionTier === plan.id ? (
                  <button className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-md font-medium cursor-not-allowed">
                    Current Plan
                  </button>
                ) : plan.id === 'free' ? (
                  <button className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-md font-medium cursor-not-allowed">
                    Free Forever
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={processingPlan === plan.id}
                    className={`w-full py-3 px-4 rounded-md font-medium ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                  >
                    {processingPlan === plan.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Upgrade Now'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Feature Comparison</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Features
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Free
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pro Monthly
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pro Yearly
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { feature: 'AI Tokens per month', free: '1,000', monthly: '10,000', yearly: '15,000' },
                { feature: 'Assignments', free: '3', monthly: 'Unlimited', yearly: 'Unlimited' },
                { feature: 'Citation Styles', free: 'Basic', monthly: 'All Styles', yearly: 'All + Custom' },
                { feature: 'Plagiarism Detection', free: false, monthly: true, yearly: true },
                { feature: 'Analytics Dashboard', free: false, monthly: 'Basic', yearly: 'Advanced' },
                { feature: 'Priority Support', free: false, monthly: true, yearly: true },
                { feature: 'API Access', free: false, monthly: false, yearly: true },
              ].map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {typeof row.free === 'boolean' ? (
                      row.free ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                      )
                    ) : (
                      row.free
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {typeof row.monthly === 'boolean' ? (
                      row.monthly ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                      )
                    ) : (
                      row.monthly
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    {typeof row.yearly === 'boolean' ? (
                      row.yearly ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                      )
                    ) : (
                      row.yearly
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              question: "What are AI tokens?",
              answer: "AI tokens represent the computational resources used when our AI assists with your writing. Each suggestion, grammar check, or citation generation uses tokens."
            },
            {
              question: "Can I change my plan anytime?",
              answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
            },
            {
              question: "Is there a free trial?",
              answer: "Our free plan gives you full access to basic features with 1,000 AI tokens per month. No credit card required!"
            },
            {
              question: "What payment methods do you accept?",
              answer: "We accept all major credit cards, PayPal, and bank transfers for yearly plans. All payments are processed securely through Stripe."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}