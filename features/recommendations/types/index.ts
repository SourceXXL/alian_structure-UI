export interface RecommendedAgent {
  id: string;
  name: string;
  description: string;
  explanation: string; // Why this is recommended
  topFeatures: string[]; // Influencing factors
  rating?: number;
  users?: number;
  imageUrl?: string;
}

export interface FeedbackData {
  agentId: string;
  rating: number; // 1-5
  comment?: string;
  usageType?: string; // e.g., 'saved', 'deployed', 'dismissed'
}
