import Link from 'next/link';
import { Button } from '@/components/ui';
import { BookOpen, Brain, Shield, Zap } from 'lucide-react';
import Header from '@/components/layout/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Writing
              <span className="text-primary-600"> Made Transparent</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Empower students with AI assistance while maintaining academic integrity.
              Track usage, ensure originality, and build better writers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register?role=student">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Writing
                </Button>
              </Link>
              <Link href="/auth/register?role=teacher">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  For Educators
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Academic Writing
            </h2>
            <p className="text-lg text-gray-600">
              Powerful tools that help students learn while maintaining transparency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI Writing Assistant
              </h3>
              <p className="text-gray-600">
                Get suggestions, citations, and explanations with full transparency
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Academic Integrity
              </h3>
              <p className="text-gray-600">
                Track AI usage and maintain originality with detailed analytics
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Assignment Canvas
              </h3>
              <p className="text-gray-600">
                Split-screen workspace with writing area and AI assistance panel
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real-time Feedback
              </h3>
              <p className="text-gray-600">
                Auto-save, rubric tracking, and instant teacher feedback
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Students Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                For Students
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-2 mr-4">
                    <Brain className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI-Powered Suggestions</h3>
                    <p className="text-gray-600">Get help with writing, citations, and complex concepts</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-2 mr-4">
                    <BookOpen className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Learn While Writing</h3>
                    <p className="text-gray-600">Understand concepts with AI explanations and improve your skills</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-2 mr-4">
                    <Shield className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Stay Original</h3>
                    <p className="text-gray-600">Track your AI usage and maintain academic integrity</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/auth/register?role=student">
                  <Button size="lg">Start Writing for Free</Button>
                </Link>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3">Assignment Canvas</h4>
                <div className="text-sm text-gray-600 mb-4">
                  Split-screen workspace with AI assistance
                </div>
                <div className="border border-gray-200 rounded p-3 text-xs text-gray-500">
                  Writing area with auto-save and real-time feedback...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Teachers Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Teacher Dashboard</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Student AI Usage</span>
                    <span className="text-primary-600">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full w-1/4"></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Originality Score</span>
                    <span className="text-green-600">89%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                For Educators
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-4">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Monitor AI Usage</h3>
                    <p className="text-gray-600">Track how students use AI assistance with detailed analytics</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-4">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Create Assignments</h3>
                    <p className="text-gray-600">Set up rubrics, deadlines, and AI usage limits</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-4">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Real-time Feedback</h3>
                    <p className="text-gray-600">Provide inline feedback and grade assignments efficiently</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/auth/register?role=teacher">
                  <Button size="lg">Start Teaching</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Academic Writing?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of students and educators using AI responsibly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-primary-400" />
                <span className="ml-2 text-xl font-bold">AI Assignment Canvas</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering students and educators with transparent AI-assisted writing tools.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/security" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Assignment Canvas. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}