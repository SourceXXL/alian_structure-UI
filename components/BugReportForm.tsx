'use client';

import React, { useState } from 'react';
import { BUG_CATEGORIES, PRIORITY_LEVELS, type BugReportFormData, type RewardCalculation } from '../types/bug-report';
import RewardCalculator from './RewardCalculator';
import ScreenshotUpload from './ScreenshotUpload';
import Button from './Button';

interface BugReportFormProps {
  onSubmit: (data: BugReportFormData) => void;
  isSubmitting?: boolean;
}

export const BugReportForm: React.FC<BugReportFormProps> = ({
  onSubmit,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<BugReportFormData>({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    priority: 'medium',
    category: 'functionality',
    reporterEmail: '',
    screenshots: [],
    agreeToTerms: false
  });

  const [reward, setReward] = useState<RewardCalculation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.stepsToReproduce.trim()) {
      newErrors.stepsToReproduce = 'Steps to reproduce are required';
    }

    if (!formData.expectedBehavior.trim()) {
      newErrors.expectedBehavior = 'Expected behavior is required';
    }

    if (!formData.actualBehavior.trim()) {
      newErrors.actualBehavior = 'Actual behavior is required';
    }

    if (formData.reporterEmail && !formData.reporterEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.reporterEmail = 'Please enter a valid email address';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BugReportFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleScreenshotsChange = (screenshots: File[]) => {
    setFormData(prev => ({ ...prev, screenshots }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-cosmic-blue">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bug Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-cosmic-purple/20 border border-cosmic-purple/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue"
                  placeholder="Brief summary of the issue"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-cosmic-purple/20 border border-cosmic-purple/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue"
                  placeholder="Detailed description of the issue"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bug Details */}
          <div className="bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-cosmic-blue">Bug Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Steps to Reproduce *
                </label>
                <textarea
                  value={formData.stepsToReproduce}
                  onChange={(e) => handleInputChange('stepsToReproduce', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-cosmic-purple/20 border border-cosmic-purple/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue"
                  placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
                />
                {errors.stepsToReproduce && (
                  <p className="mt-1 text-sm text-red-400">{errors.stepsToReproduce}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expected Behavior *
                </label>
                <textarea
                  value={formData.expectedBehavior}
                  onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-cosmic-purple/20 border border-cosmic-purple/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue"
                  placeholder="What should have happened"
                />
                {errors.expectedBehavior && (
                  <p className="mt-1 text-sm text-red-400">{errors.expectedBehavior}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Actual Behavior *
                </label>
                <textarea
                  value={formData.actualBehavior}
                  onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-cosmic-purple/20 border border-cosmic-purple/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue"
                  placeholder="What actually happened"
                />
                {errors.actualBehavior && (
                  <p className="mt-1 text-sm text-red-400">{errors.actualBehavior}</p>
                )}
              </div>
            </div>
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg p-6 backdrop-blur-sm">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority Level *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 bg-cosmic-purple/20 border border-cosmic-purple/50 rounded-lg text-white focus:outline-none focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue"
              >
                {PRIORITY_LEVELS.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label} - {priority.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg p-6 backdrop-blur-sm">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-cosmic-purple/20 border border-cosmic-purple/50 rounded-lg text-white focus:outline-none focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue"
              >
                {BUG_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Screenshots */}
          <div className="bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-cosmic-blue">Screenshots</h3>
            <ScreenshotUpload
              onScreenshotsChange={handleScreenshotsChange}
              maxFiles={5}
              maxSize={10}
            />
          </div>

          {/* Contact Information */}
          <div className="bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-cosmic-blue">Contact Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={formData.reporterEmail}
                onChange={(e) => handleInputChange('reporterEmail', e.target.value)}
                className="w-full px-3 py-2 bg-cosmic-purple/20 border border-cosmic-purple/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue"
                placeholder="your.email@example.com"
              />
              {errors.reporterEmail && (
                <p className="mt-1 text-sm text-red-400">{errors.reporterEmail}</p>
              )}
              <p className="mt-2 text-sm text-gray-400">
                Provide your email if you'd like updates about your bug report
              </p>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className="mt-1 w-4 h-4 bg-cosmic-purple/20 border-cosmic-purple/50 rounded focus:ring-cosmic-blue focus:ring-1"
              />
              <div className="flex-1">
                <label htmlFor="agreeToTerms" className="text-sm text-gray-300">
                  I agree to the terms and conditions for bug reporting. I understand that:
                  <ul className="mt-2 ml-4 list-disc text-sm text-gray-400">
                    <li>The report will be reviewed by the development team</li>
                    <li>Rewards are subject to approval and may vary</li>
                    <li>False or duplicate reports may be rejected</li>
                    <li>My report may be shared with relevant team members</li>
                  </ul>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-2 text-sm text-red-400">{errors.agreeToTerms}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
            </Button>
          </div>
        </div>

        {/* Reward Calculator Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <RewardCalculator
              priority={formData.priority}
              category={formData.category}
              onRewardChange={setReward}
            />

            {reward && (
              <div className="bg-gradient-to-r from-cosmic-purple to-cosmic-blue p-1 rounded-lg">
                <div className="bg-[rgb(var(--page-background))] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Potential Reward</h4>
                  <div className="text-3xl font-bold text-cosmic-blue mb-2">
                    {reward.totalReward} XLM
                  </div>
                  <p className="text-xs text-gray-400">
                    Estimated payout: {new Date(reward.estimatedPayoutDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="text-sm font-medium text-cosmic-blue mb-3">Reporting Guidelines</h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span>Be as detailed as possible in your description</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span>Include clear steps to reproduce the issue</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span>Add screenshots when possible</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span>Check for existing reports before submitting</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span>Security issues should be reported privately</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default BugReportForm;
