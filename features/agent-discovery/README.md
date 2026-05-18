# Agent Discovery System

This directory contains the implementation of the Agent Discovery System for the stellAIverse application.

## Features
- Full-text search across agent names, descriptions, and capabilities.
- Multi-criteria filtering (category, price range, rating, contract type).
- Trending and recommended agents based on Stellar transaction history.
- Saved searches for quick access.
- Search analytics tracking.

## Directory Structure
```
agent-discovery/
├── components/       # React components for the UI
├── services/         # Backend services for search and recommendations
├── hooks/            # Custom React hooks for state management
├── utils/            # Utility functions for search and filtering
└── tests/            # Unit and integration tests
```

## Setup
1. Install dependencies:
   ```bash
   npm install algoliasearch use-debounce lodash
   ```
2. Add environment variables for Algolia:
   ```bash
   ALGOLIA_APP_ID=your-app-id
   ALGOLIA_API_KEY=your-api-key
   ALGOLIA_INDEX_NAME=your-index-name
   ```

## Development
- Run the development server:
  ```bash
  npm run dev
  ```
- Run tests:
  ```bash
  npm run test
  ```

## Testing
- Unit tests for search query builder.
- Integration tests for filtering logic.
- Performance tests for search responses.
- Tests for recommendation algorithm.

## Dependencies
- `algoliasearch`
- `use-debounce`
- `lodash`