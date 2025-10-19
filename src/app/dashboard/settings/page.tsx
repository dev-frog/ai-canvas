'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserIcon,
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { user, loading, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferences: {
      citationStyle: 'APA' as 'APA' | 'MLA' | 'Harvard' | 'Chicago',
      autoSave: true,
      aiAssistanceLevel: 'moderate' as 'minimal' | 'moderate' | 'full'
    }
  });
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        preferences: user.preferences
      });
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        preferences: formData.preferences
      });

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md z-50';
      successMsg.textContent = 'Settings saved successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);

      // Show error message
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md z-50';
      errorMsg.textContent = 'Failed to save settings. Please try again.';
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 3000);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'preferences', name: 'Preferences', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <div className="px-4 sm:px-6 py-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your account settings and preferences</p>
            </div>

            {/* Mobile Dropdown */}
            <div className="sm:hidden px-4 pb-4">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Tabs */}
            <nav className="hidden sm:flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Profile Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      value={user?.role || ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 capitalize"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Type</label>
                    <input
                      type="text"
                      value={user?.subscriptionTier || 'free'}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 capitalize"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Academic Preferences</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Citation Style</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['APA', 'MLA', 'Harvard', 'Chicago'].map((style) => (
                        <button
                          key={style}
                          onClick={() => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, citationStyle: style as any }
                          })}
                          className={`${
                            formData.preferences.citationStyle === style
                              ? 'bg-blue-100 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          } border-2 rounded-lg p-3 text-center font-medium transition-colors`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AI Assistance Level</label>
                    <div className="space-y-2">
                      {[
                        { value: 'minimal', label: 'Minimal', description: 'Basic grammar and spelling checks only' },
                        { value: 'moderate', label: 'Moderate', description: 'Grammar, style suggestions, and citations' },
                        { value: 'full', label: 'Full', description: 'Comprehensive writing assistance and content suggestions' }
                      ].map((level) => (
                        <div
                          key={level.value}
                          onClick={() => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, aiAssistanceLevel: level.value as any }
                          })}
                          className={`${
                            formData.preferences.aiAssistanceLevel === level.value
                              ? 'bg-blue-50 border-blue-500'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          } border-2 rounded-lg p-4 cursor-pointer transition-colors`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{level.label}</h4>
                              <p className="text-sm text-gray-500">{level.description}</p>
                            </div>
                            {formData.preferences.aiAssistanceLevel === level.value && (
                              <CheckIcon className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Auto-save</h4>
                      <p className="text-sm text-gray-500">Automatically save your work every few seconds</p>
                    </div>
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, autoSave: !formData.preferences.autoSave }
                      })}
                      className={`${
                        formData.preferences.autoSave ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                    >
                      <span
                        className={`${
                          formData.preferences.autoSave ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Notification Preferences</h2>
                <div className="space-y-4">
                  <p className="text-gray-600">Notification settings will be available in a future update.</p>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Security Settings</h2>
                <div className="space-y-4">
                  <p className="text-gray-600">Security settings will be available in a future update.</p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}