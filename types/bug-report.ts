export interface BugReport {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'functionality' | 'performance' | 'security' | 'other';
  screenshots: string[];
  reporterAddress: string;
  reporterEmail?: string;
  status: 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  rewardAmount: number;
  rewardStatus: 'pending' | 'approved' | 'paid' | 'rejected';
  assignedTo?: string;
  resolutionNotes?: string;
}

export interface BugReportSubmission {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'functionality' | 'performance' | 'security' | 'other';
  screenshots: File[];
  reporterEmail?: string;
}

export interface RewardCalculation {
  baseReward: number;
  priorityMultiplier: number;
  categoryMultiplier: number;
  totalReward: number;
  estimatedPayoutDate: string;
}

export interface BugReportFormData {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'functionality' | 'performance' | 'security' | 'other';
  reporterEmail: string;
  screenshots: File[];
  agreeToTerms: boolean;
}

export const PRIORITY_REWARDS = {
  low: 10,
  medium: 25,
  high: 50,
  critical: 100
} as const;

export const CATEGORY_MULTIPLIERS = {
  ui: 1.0,
  functionality: 1.2,
  performance: 1.5,
  security: 2.0,
  other: 0.8
} as const;

export const BUG_CATEGORIES = [
  { value: 'ui', label: 'UI/UX Issue', description: 'Visual design, layout, or user interface problems' },
  { value: 'functionality', label: 'Functionality', description: 'Features not working as expected' },
  { value: 'performance', label: 'Performance', description: 'Slow loading, lag, or resource issues' },
  { value: 'security', label: 'Security', description: 'Vulnerabilities or security concerns' },
  { value: 'other', label: 'Other', description: 'Issues that don\'t fit other categories' }
] as const;

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', description: 'Minor inconvenience, workaround available' },
  { value: 'medium', label: 'Medium', description: 'Significant impact, partial workaround' },
  { value: 'high', label: 'High', description: 'Major functionality broken, no workaround' },
  { value: 'critical', label: 'Critical', description: 'System-breaking issue or security vulnerability' }
] as const;
