# Quota & Rate-Limit Management System

## Overview
This system provides real-time visibility into API usage and allows administrators to manage access policies dynamically. It's integrated into both the user portfolio (for monitoring) and the governance dashboard (for administration).

## Technical Architecture

### 1. Real-time Telemetry (`QuotaVisualization`)
- **Location**: `features/agent-telemetry/components/QuotaVisualization.tsx`
- **Functionality**:
  - **Dynamic Meter**: Displays cumulative daily usage against total limits.
  - **Live Sparkline**: Visualizes the last 20 seconds of request-per-second (req/s) activity.
  - **Status Indicators**: Changes color and pulses when usage exceeds 80% of the allocated rate limit.
- **Data Source**: Uses `quotaService.subscribeToLiveUpdates` for low-latency state synchronization.

### 2. Governance Console (`PolicyManager`)
- **Location**: `features/governance/components/PolicyManager.tsx`
- **Functionality**:
  - **Tier Overview**: Lists current policies (Free, Pro, Enterprise) with their limits.
  - **Hot-swappable Limits**: Admins can select any policy and update `quotaLimit` or `rateLimit` instantly.
  - **Validation**: Ensures changes are persistent and validated against backend logic.

### 3. Data Infrastructure (`quotaService`)
- **Location**: `features/agent-telemetry/services/quotaService.ts`
- **API Surface**:
  - `getQuotaData(userId)`: Retrieve current state.
  - `updatePolicy(policy)`: Admin action to modify a policy tier.
  - `subscribeToLiveUpdates(callback)`: Websocket/Polling simulation for real-time telemetry.

## User Experience (UX)
- **Visual Feedback**: Meters use cosmic gradients (`cosmic-purple` to `cosmic-blue`) for high visibility.
- **Responsiveness**: All visualizations are fully responsive and adapt to mobile viewports.
- **Admin Alerts**: The UI highlights "CRITICAL" states when limits are nearly reached, aiding in proactive maintenance.

## Integration Points
- **Portfolio Page**: Provides users with a transparent view of their agent's operational health.
- **Governance Page**: Centralizes policy control for platform maintainers.
