# Recommendation Engine Module

## Overview
The Recommendation Engine module provides personalized agent suggestions to users based on their search history, skill tags, and usage patterns. It uses a cosmic-themed UI with rich animations and interactive feedback loops.

## Core Components

### `RecommendationCarousel`
- **Location**: `features/recommendations/components/RecommendationCarousel.tsx`
- **Purpose**: Fetches and displays a list of recommended agents.
- **State Management**: Uses `useEffect` to trigger data fetching from `recommendationService`.
- **UI**: Uses a responsive grid with a "Live Engine Active" indicator and background nebula effects.

### `RecommendationCard`
- **Location**: `features/recommendations/components/RecommendationCard.tsx`
- **Purpose**: Displays detailed information for a single recommended agent.
- **Key Features**:
  - **Engagement Explanation**: A highlighted section ("Personal Insight") that explains *why* the agent was recommended.
  - **Influencing Factors**: Chips showing "Top Features" that contributed to the recommendation.
  - **Animated Borders**: Uses pulse-slow animations and cosmic gradients for a premium feel.

### `FeedbackButton`
- **Location**: `features/recommendations/components/FeedbackButton.tsx`
- **Purpose**: Collects explicit user feedback (1-5 star ratings).
- **Functionality**:
  - On click, sends the `agentId` and `rating` to the backend.
  - Displays a "Feedback sent!" pulse notification for 3 seconds.

## Service Layer

### `recommendationService`
- **Location**: `features/recommendations/services/recommendationService.ts`
- **Methods**:
  - `getRecommendations()`: Asynchronous call to fetch personalized recommendations (currently mocked with 1.2s delay).
  - `sendFeedback(feedback: FeedbackData)`: Asynchronous call to send user feedback to the analytics backend.

## Data Types

Defined in `features/recommendations/types/index.ts`:

```typescript
export interface RecommendedAgent {
  id: string;
  name: string;
  description: string;
  explanation: string; // Explains the ranking logic
  topFeatures: string[]; // List of factors influencing the rank
  rating?: number;
  users?: number;
  imageUrl?: string;
}

export interface FeedbackData {
  agentId: string;
  rating: number; // 1-5
  comment?: string;
  usageType?: string; // 'saved', 'deployed', 'dismissed'
}
```

## Integration
The module is currently integrated into the `Marketplace` page (`app/marketplace/page.tsx`).
