# Referral Sharing Feature

A comprehensive referral sharing system for the stellAIverse platform that enables users to generate referral links, share them across social media, track performance, and earn rewards.

## Features

### Core Functionality
- **Referral Link Generation**: Create unique referral codes with customizable rewards
- **Social Media Sharing**: Share links on Twitter, Facebook, LinkedIn, WhatsApp, and Telegram
- **QR Code Generation**: Generate downloadable QR codes for easy sharing
- **Copy Link**: One-click copy to clipboard functionality
- **Analytics Tracking**: Comprehensive tracking of clicks, signups, and conversions
- **Reward Management**: Track and claim earned rewards

### Components

#### Services
- `referralService.ts`: Core referral link management and API integration
- `socialShareService.ts`: Social media sharing functionality
- `analyticsService.ts`: Analytics tracking and reporting

#### Components
- `ReferralShareModal.tsx`: Main sharing modal with all sharing options
- `SocialShareButton.tsx`: Individual social media sharing buttons
- `QRCodeGenerator.tsx`: QR code generation and download functionality

#### Hooks
- `useReferral.ts`: React hook for referral data management

#### Types
- `index.ts`: TypeScript type definitions for all referral-related interfaces

## Usage

### Basic Implementation

```tsx
import React, { useState } from 'react';
import ReferralShareModal from './features/referral-sharing/components/ReferralShareModal';

const MyComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const userId = 'user123'; // Get from auth context

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        Share & Earn
      </button>
      
      <ReferralShareModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userId={userId}
      />
    </div>
  );
};
```

### Using the Hook

```tsx
import { useReferral } from './features/referral-sharing/hooks/useReferral';

const ReferralDashboard = () => {
  const userId = 'user123';
  const {
    stats,
    referralLinks,
    rewards,
    isLoading,
    generateReferralLink,
    claimReward,
  } = useReferral(userId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Referral Stats</h1>
      <p>Total Clicks: {stats?.totalClicks}</p>
      <p>Total Signups: {stats?.totalSignups}</p>
      
      <button onClick={() => generateReferralLink('10 XLM')}>
        Generate New Link
      </button>
    </div>
  );
};
```

## API Integration

The feature expects the following API endpoints:

### Referral Endpoints
- `POST /referrals/generate` - Create new referral link
- `GET /referrals/user/:userId/links` - Get user's referral links
- `GET /referrals/user/:userId/stats` - Get referral statistics
- `POST /referrals/track` - Track referral events
- `GET /referrals/validate/:code` - Validate referral code
- `POST /referrals/rewards/:rewardId/claim` - Claim reward
- `PUT /referrals/links/:id` - Update referral link
- `DELETE /referrals/links/:id` - Delete referral link

### Analytics Endpoints
- `POST /analytics/track` - Track analytics events
- `GET /analytics/referral/:code` - Get referral analytics
- `GET /analytics/user/:userId/summary` - Get user analytics summary

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Styling
The components use Tailwind CSS classes and follow the existing cosmic theme of the stellAIverse platform.

## Testing

Run the tests with:

```bash
npm test -- features/referral-sharing
```

### Test Coverage
- Referral service functionality
- Social share service functionality
- Component interactions
- Error handling
- Edge cases

## Analytics Tracking

The system tracks the following events:
- **Click**: When someone clicks on a referral link
- **Signup**: When a new user signs up with a referral code
- **Conversion**: When a referred user completes a key action
- **Source**: The platform/method used for sharing (twitter, facebook, copy, etc.)

## Security Considerations

- Referral codes are generated using cryptographically secure random strings
- API calls include proper error handling and fallback mechanisms
- Sensitive operations (like claiming rewards) require proper authentication
- Rate limiting should be implemented on the backend for referral link generation

## Performance Optimizations

- Local storage fallback for offline analytics tracking
- Lazy loading of QR codes
- Debounced API calls where appropriate
- Efficient state management using React hooks

## Browser Compatibility

- Modern browsers with ES6+ support
- Clipboard API with fallback for older browsers
- Web Share API with graceful degradation
- Canvas API for QR code generation

## Future Enhancements

- A/B testing for referral messaging
- Advanced analytics dashboard
- Referral tier system
- Gamification elements
- Integration with more social platforms
- Bulk referral link generation
- Referral leaderboards
