import { RecommendedAgent, FeedbackData } from '../types';

export const recommendationService = {
  getRecommendations: async (): Promise<RecommendedAgent[]> => {
    try {
      // Simulator fetching data from backend
      // In a real app, use fetch('/api/recommendations')
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: 'agent-1',
              name: 'Nebula Analytica',
              description: 'AI-driven data analysis for complex datasets.',
              explanation: 'Based on your interest in data visualization and recent searches for "Stellar analytics".',
              topFeatures: ['High-performance processing', 'Interactive dashboards', 'Multi-cloud integration'],
              rating: 4.8,
              users: 1540,
            },
            {
              id: 'agent-2',
              name: 'Cosmic Writer',
              description: 'Generates creative content with a stellar twist.',
              explanation: 'Matches your frequent use of content generation tools and "Creative" skill tag.',
              topFeatures: ['Brand-aware content', 'Multi-language support', 'Image-to-text integration'],
              rating: 4.7,
              users: 980,
            },
            {
              id: 'agent-3',
              name: 'Starship Navigator',
              description: 'Pathfinding and logistics optimization for space travel.',
              explanation: 'Highly relevant to your projects in logistics and your "Navigator" badge.',
              topFeatures: ['Real-time obstacle avoidance', 'Fuel efficiency analysis', 'Auto-docking system'],
              rating: 4.9,
              users: 210,
            },
          ]);
        }, 1200);
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  },

  sendFeedback: async (feedback: FeedbackData): Promise<boolean> => {
    try {
      console.log('Sending feedback to backend:', feedback);
      // In a real app, use fetch('/api/recommendations/feedback', { method: 'POST', body: JSON.stringify(feedback) })
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 500);
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
      return false;
    }
  },
};
