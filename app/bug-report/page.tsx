'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import BugReportForm from '../../components/BugReportForm';
import { type BugReportFormData } from '../../types/bug-report';

const BugReportPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const submitBugReport = async (data: BugReportFormData): Promise<void> => {
    // This would be replaced with actual API call
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('stepsToReproduce', data.stepsToReproduce);
    formData.append('expectedBehavior', data.expectedBehavior);
    formData.append('actualBehavior', data.actualBehavior);
    formData.append('priority', data.priority);
    formData.append('category', data.category);
    formData.append('reporterEmail', data.reporterEmail || '');
    formData.append('agreeToTerms', data.agreeToTerms.toString());

    // Append screenshots
    data.screenshots.forEach((screenshot, index) => {
      formData.append(`screenshot_${index}`, screenshot);
    });

    const response = await fetch('/api/bug-reports', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit bug report');
    }
  };

  const mutation = useMutation({
    mutationFn: submitBugReport,
    onSuccess: () => {
      setIsSubmitted(true);
      setSubmissionError(null);
    },
    onError: (error: Error) => {
      setSubmissionError(error.message);
    },
  });

  const handleSubmit = (data: BugReportFormData) => {
    mutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Bug Report Submitted!
            </h1>
            <p className="text-xl text-gray-300">
              Thank you for helping improve stellAIverse
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-8 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-semibold text-white mb-4">
                Your Report Has Been Received
              </h2>
              
              <div className="space-y-4 text-gray-300">
                <p>
                  Our development team will review your bug report shortly. You'll receive updates via email if you provided your contact information.
                </p>
                
                <div className="bg-cosmic-purple/20 rounded-lg p-4 mt-6">
                  <h3 className="font-medium text-cosmic-blue mb-2">What happens next?</h3>
                  <ul className="text-sm space-y-2 text-left">
                    <li>• Your report will be reviewed by our team</li>
                    <li>• We'll assess the bug and determine the reward amount</li>
                    <li>• If approved, rewards will be paid within 7 days</li>
                    <li>• You'll receive email updates on the status</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 space-x-4">
                <button
                  onClick={() => window.location.href = '/bug-reports'}
                  className="px-6 py-3 bg-cosmic-purple hover:bg-cosmic-purple/80 text-white rounded-lg transition-colors"
                >
                  View Your Reports
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-cosmic-purple/30 hover:bg-cosmic-purple/60 text-white rounded-lg transition-colors"
                >
                  Report Another Bug
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Report a Bug
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Help us improve stellAIverse by reporting issues
          </p>
          <p className="text-lg text-cosmic-blue">
            Earn rewards for valuable bug reports
          </p>
        </div>

        {submissionError && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-400">Error: {submissionError}</p>
            </div>
          </div>
        )}

        <BugReportForm
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />

        <div className="mt-12 text-center">
          <div className="bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg p-6 backdrop-blur-sm max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-cosmic-blue mb-4">
              Why Report Bugs?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
              <div>
                <div className="w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-cosmic-blue"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-white mb-2">Earn Rewards</h4>
                <p>Get paid in XLM for finding and reporting valuable bugs</p>
              </div>
              
              <div>
                <div className="w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-cosmic-blue"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-white mb-2">Improve Platform</h4>
                <p>Help us make stellAIverse better for everyone</p>
              </div>
              
              <div>
                <div className="w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-cosmic-blue"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-white mb-2">Be Recognized</h4>
                <p>Get credit for your contributions to the ecosystem</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugReportPage;
