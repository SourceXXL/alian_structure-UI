# 🌍 Alian Structure - Direct Aid Distribution Platform

> **Free, open-source humanitarian aid platform using Stellar blockchain for transparent, zero-friction direct aid from donors to people in need.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14+-black.svg)
![Stellar](https://img.shields.io/badge/Stellar-blockchain-blue.svg)
![Status](https://img.shields.io/badge/status-active%20development-brightgreen.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Why Alian Structure](#why-alian-structure)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Support & Community](#support--community)
- [License](#license)

---

## 🎯 Overview

**Alian Structure** is a revolutionary humanitarian aid platform that leverages the Stellar blockchain to solve the fundamental problems in charitable giving:

### The Problem
Traditional aid systems suffer from:
- **Aid Leakage**: 40-60% of donations lost to intermediaries
- **Lack of Transparency**: Donors can't verify where money goes
- **Unbanked Exclusion**: Recipients without bank accounts can't receive aid
- **Verification Impossibility**: No way to prove aid reached intended recipients

### Our Solution
Alian Structure enables:
- ✅ **Direct Delivery**: Donor → Recipient (zero intermediaries)
- ✅ **Complete Transparency**: Immutable on-chain proof of delivery
- ✅ **Financial Inclusion**: Stellar wallets accessible globally
- ✅ **AI-Verified Safety**: Private need assessment before payment
- ✅ **Cost Efficiency**: Near-zero transaction fees (~0.00001 XLM)

---

## 💡 Why Alian Structure

### For Donors
- 🔍 **Verification**: See exactly where your money goes via transaction hash
- 💰 **Efficiency**: 95%+ of donation reaches beneficiaries (vs 40% traditionally)
- 🌍 **Global Reach**: Support anyone with internet, no geography barriers
- 📊 **Impact Tracking**: Real-time dashboard showing lives affected

### For Recipients
- 💼 **No Bank Required**: Only internet connection needed
- ⚡ **Instant Settlement**: Receive funds in 3-5 seconds
- 🔐 **Security**: Cryptographic proof of ownership
- 🌐 **Global Access**: Money works across 150+ countries

### For NGOs & Administrators
- 📈 **Program Management**: Affiliate system, commission tracking, payouts
- 🧠 **AI Verification**: Privacy-preserving need assessment
- 📊 **Detailed Reporting**: Export data, track metrics, audit trail
- 🔒 **Security**: Wallet-based authentication, role-based access control

---

## 🚀 Key Features

### Core Platform
- 🧙 **Claim Link Creation**: Simple interface for donors to create aid claim links
- 🔗 **Referral System**: Share links, earn commissions in XLM
- 📊 **Real-Time Dashboard**: Track referrals, earnings, and impact
- 🤖 **AI Verification**: Privacy-first need assessment before settlement
- ⛓️ **On-Chain Proof**: Immutable transaction records for transparency

### Affiliate Program
- 💵 **Multi-Tier Commissions**: Direct, Tier 2, Tier 3 referral rewards
- 📊 **Earnings Analytics**: Charts, breakdowns, trend analysis
- 💸 **Payout Management**: Request payouts, track status, view history
- 🔐 **Secure Wallets**: Freighter, Albedo, Ledger wallet support

### User Experience
- ✨ **Cosmic UI Theme**: Beautiful dark-mode interface with animations
- 📱 **PWA Ready**: Offline support, installable app, background sync
- ⚡ **Lightning Fast**: Advanced caching, optimized performance
- 🔔 **Push Notifications**: Real-time updates on activities
- 🎓 **Educational Mode**: Learn best practices for platform use

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Next.js** | React framework with SSR/SSG | 14+ |
| **TypeScript** | Type-safe development | 5.0+ |
| **Tailwind CSS** | Utility-first styling | 3.x |
| **React Context** | Global state management | Latest |
| **Stellar SDK** | Blockchain integration | Latest |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **NestJS** | Node.js framework | 10+ |
| **TypeScript** | Type-safe backend | 5.0+ |
| **PostgreSQL** | Primary database | 14+ |
| **Redis** | Caching & queuing | 7+ |
| **BullMQ** | Job queue | Latest |

### Blockchain
| Service | Role | Network |
|---------|------|---------|
| **Stellar** | Payment settlement | Public/Testnet |
| **Freighter** | Wallet integration | Multi-chain |
| **Albedo** | Alternative wallet | Stellar |
| **Ledger** | Hardware wallet | Stellar |

### Infrastructure
- **Docker**: Containerized deployment
- **OpenTelemetry**: Distributed tracing
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboard

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Donor / Recipient                        │
└──────────────┬────────────────────────────┬──────────────────┘
               │                            │
        ┌──────▼────────┐           ┌──────▼────────┐
        │   Frontend    │           │  Wallet       │
        │  (Next.js)    │           │ (Stellar)     │
        │               │           │               │
        │ • UI/UX       │◄─────────►│ • Freighter   │
        │ • Forms       │           │ • Albedo      │
        │ • Dashboard   │           │ • Ledger      │
        └──────┬────────┘           └──────────────┘
               │
        ┌──────▼─────────────────────────────────────┐
        │         API Gateway & Auth                 │
        │      (JWT, Wallet Signature)               │
        └──────┬──────────────────────────────────────┘
               │
        ┌──────▼─────────────────────────────────────┐
        │     Backend Services (NestJS)              │
        │                                            │
        │ ┌──────────────┐  ┌──────────────┐        │
        │ │ Affiliate    │  │   Payment    │        │
        │ │ Service      │  │   Service    │        │
        │ ├──────────────┤  ├──────────────┤        │
        │ │ Commission   │  │   AI         │        │
        │ │ Tracking     │  │   Verify     │        │
        │ ├──────────────┤  ├──────────────┤        │
        │ │ Payout Mgmt  │  │   Oracle     │        │
        │ └──────────────┘  └──────────────┘        │
        └──────┬────────────────────────────────────┘
               │
    ┌──────────┴──────────────┬─────────────────────┐
    │                         │                     │
┌───▼────┐            ┌──────▼──────┐        ┌──────▼──────┐
│PostgreSQL         │   Redis      │        │  Stellar    │
│Database           │   Cache      │        │  Blockchain │
│                   │              │        │             │
│ • Users           │ • Sessions   │        │ • Payments  │
│ • Affiliates      │ • Jobs       │        │ • Ledger    │
│ • Referrals       │ • Metrics    │        │ • Accounts  │
│ • Payouts         │              │        │             │
└────────┘          └──────────────┘        └─────────────┘
```

### Data Flow

1. **User Connection**
   - User connects Stellar wallet (Freighter/Albedo/Ledger)
   - Wallet address used for authentication
   - JWT token issued for session

2. **Aid Creation**
   - Donor creates claim link with amount
   - Link shared with recipients
   - Recipients access via link

3. **Verification & Settlement**
   - AI verifies recipient need (private)
   - Payment executed on Stellar blockchain
   - Transaction hash stored immutably
   - Verification metadata recorded on-chain

4. **Affiliate Tracking**
   - Referral tracked via code/link
   - Commission calculated automatically
   - Stored in database and on-chain
   - User can request payout anytime

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Node.js 18+ (https://nodejs.org/)
- npm or yarn (https://yarnpkg.com/)
- Git (https://git-scm.com/)

# Optional but recommended
- Docker & Docker Compose
- PostgreSQL 14+ (or use Docker)
- Redis (or use Docker)
```

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/SourceXXL/alian_structure-UI.git
cd alian_structure-UI
```

#### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

#### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
# Minimum required:
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

#### 4. Run Development Server

```bash
# Start development server with hot reload
npm run dev

# Visit http://localhost:3000
```

#### 5. Build for Production

```bash
# Build optimized bundle
npm run build

# Run production server
npm run start
```

#### 6. Run Tests

```bash
# Run test suite
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Docker Setup (Optional)

```bash
# Build Docker image
docker build -t alian-structure:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3001 \
  alian-structure:latest
```

### With Docker Compose

```bash
# Run full stack (frontend + backend + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📁 Project Structure

```
alian_structure-UI/
├── app/                              # Next.js app directory
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   ├── affiliates/                  # Affiliate routes
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── api/                         # API routes
│       ├── auth/
│       └── affiliates/
├── components/                       # React components
│   ├── Navigation.tsx               # Header/nav
│   ├── ConnectWallet.tsx            # Wallet connection button
│   ├── WalletAddress.tsx            # Address display
│   ├── NetworkSwitcher.tsx          # Network selector
│   └── context/
│       └── StellarWalletProvider.tsx # Wallet context
├── features/                         # Feature modules
│   └── affiliate-dashboard/
│       ├── components/
│       ├── hooks/
│       ├── store/
│       ├── services/
│       └── types/
├── lib/                             # Utilities & helpers
│   ├── stellar.ts                  # Stellar SDK utilities
│   ├── stellar-constants.ts        # Network config
│   └── api-client.ts               # API utilities
├── styles/                          # Global styles
│   ├── globals.css
│   └── tailwind.config.js
├── public/                          # Static assets
│   ├── images/
│   └── icons/
├── tests/                           # Test suite
│   ├── __tests__/
│   └── e2e/
├── docs/                            # Documentation
│   ├── SETUP.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── CONTRIBUTING.md
├── .env.example                     # Environment template
├── .env.local                       # Local config (not committed)
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript config
├── next.config.js                   # Next.js config
└── README.md                        # This file
```

---

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development

# Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK=testnet  # testnet | public
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org

# Auth
NEXT_PUBLIC_JWT_EXPIRY=7d
SESSION_STORAGE_KEY=alian_session

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_AFFILIATE=true
NEXT_PUBLIC_ENABLE_PWA=true
```

### Database Configuration

See backend repository: [alian_structure-api](https://github.com/SourceXXL/alian_structure-api)

---

## 🔗 Wallet Integration

### Supported Wallets

| Wallet | Support | Version |
|--------|---------|---------|
| **Freighter** | ✅ Full | 5.0+ |
| **Albedo** | ✅ Full | Latest |
| **Ledger** | ✅ Full | Latest |

### Connection Flow

```typescript
import { useStellarWallet } from '@/components/context/StellarWalletProvider';

export function MyComponent() {
  const { wallet, connectWallet, disconnectWallet } = useStellarWallet();

  return (
    <div>
      {wallet?.isConnected ? (
        <>
          <p>Connected: {wallet.publicKey}</p>
          <p>Balance: {wallet.balances[0]?.balance} XLM</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </>
      ) : (
        <button onClick={() => connectWallet('freighter')}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}
```

---

## 💰 Affiliate Program

### Commission Structure

| Tier | Source | Rate |
|------|--------|------|
| **Direct** | Your referrals | 10% of volume |
| **Tier 2** | Their referrals | 5% of volume |
| **Tier 3** | Their referrals | 2% of volume |

### Payout Settings

- **Minimum**: 100 XLM
- **Frequency**: Weekly
- **Processing**: 1-2 business days
- **Method**: Stellar wallet transfer

### Dashboard Features

- 📊 Real-time earnings tracking
- 📈 Commission breakdown by tier
- 🔗 Referral code generation
- 💸 Payout request system
- 📋 Transaction history
- 📑 Earnings reports

---

## 🧪 Testing

### Test Structure

```bash
tests/
├── __tests__/
│   ├── wallet.test.tsx        # Wallet component tests
│   ├── affiliate.test.tsx      # Affiliate dashboard tests
│   └── integration/
│       └── stellar.test.tsx    # Stellar integration tests
└── e2e/
    ├── wallet.e2e.test.tsx     # E2E wallet flows
    └── affiliate.e2e.test.tsx  # E2E affiliate flows
```

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests (requires running app)
npm run test:e2e
```

---

## 📱 Progressive Web App (PWA)

### Features
- ✅ Offline access to cached pages
- ✅ App installability on mobile/desktop
- ✅ Background sync for data
- ✅ Push notifications
- ✅ Advanced caching strategies

### Enable PWA

```bash
# Run setup script
chmod +x scripts/setup-pwa.sh
./scripts/setup-pwa.sh

# Or manual setup
npm install next-pwa workbox-webpack-plugin
npm run build
```

---

## 🔒 Security

### Best Practices

- ✅ Never expose private keys
- ✅ Always validate wallet addresses (56 chars, starts with G)
- ✅ Use HTTPS in production
- ✅ Implement rate limiting on API calls
- ✅ Keep dependencies updated
- ✅ Regular security audits

### Authentication

- Wallet-based (primary): Freighter/Albedo/Ledger
- Email/Password (optional): bcrypt hashing, JWT tokens
- Session persistence: localStorage with encryption
- Multi-wallet delegation support

### Data Protection

- Stellar address validation on all requests
- Amount validation and minimum thresholds
- Transaction hash tracking for audit trail
- PII-safe metrics export
- CORS whitelist configuration

---

## 🤝 Contributing

We welcome contributions from developers, designers, and community members!

### Getting Started

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow existing code style (Prettier/ESLint configured)
- Add tests for new features
- Update documentation accordingly
- Keep commits atomic and descriptive
- Link related issues in PR description

### Development Workflow

```bash
# Install dependencies
npm install

# Create feature branch
git checkout -b feature/your-feature

# Make changes
# Edit files, write tests, etc.

# Run tests & linting
npm run lint
npm test

# Push and create PR
git push origin feature/your-feature
```

### Reporting Issues

- 🐛 **Bugs**: Use issue template, include reproduction steps
- 💡 **Features**: Describe use case and expected behavior
- ❓ **Questions**: Use Discussions for general questions

---

## 📚 Documentation

- **[Setup Guide](./docs/SETUP.md)** - Detailed installation instructions
- **[API Reference](./docs/API.md)** - Endpoint documentation
- **[Architecture](./docs/ARCHITECTURE.md)** - System design details
- **[Contributing](./CONTRIBUTING.md)** - Contribution guidelines
- **[Stellar Integration](./STELLAR_WALLET_INTEGRATION.md)** - Wallet setup
- **[PWA Guide](./docs/PWA_IMPLEMENTATION.md)** - Progressive Web App
- **[Metrics Dashboard](./docs/metrics-dashboard.md)** - Telemetry & monitoring

---

## 🆘 Support & Community

### Getting Help

- 📖 **Documentation**: Check [docs/](./docs/) first
- 🐛 **Issue Tracker**: [GitHub Issues](https://github.com/SourceXXL/alian_structure-UI/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/SourceXXL/alian_structure-UI/discussions)
- 🔗 **Backend Repo**: [alian_structure-api](https://github.com/SourceXXL/alian_structure-api)

### Community Resources

- 📧 Email: support@alianstructure.com
- 🌐 Website: https://alianstructure.com
- 🐦 Twitter: [@AlianStructure](https://twitter.com/AlianStructure)
- 💬 Discord: [Join Server](https://discord.gg/alianstructure)

---

## 📊 Status

- ✅ **Frontend**: Active Development
- ✅ **Backend**: Active Development
- ✅ **Stellar Integration**: Production-Ready
- 🔄 **Affiliate System**: Testing Phase
- 📋 **Roadmap**: See [ROADMAP.md](./ROADMAP.md)

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](./LICENSE) file for details.

You are free to:
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Use privately

With the requirement to:
- 📝 Include license and copyright notice

---

## 🙏 Acknowledgments

- **Stellar Development Foundation** for the incredible blockchain infrastructure
- **Next.js & Vercel** for the amazing React framework
- **Open source community** for countless libraries and tools
- **Contributors** who help make this project better

---

## 📈 Project Stats

- **Repository**: [SourceXXL/alian_structure-UI](https://github.com/SourceXXL/alian_structure-UI)
- **Language**: TypeScript
- **License**: MIT
- **Created**: 2026
- **Status**: 🟢 Active Development

---

<div align="center">

**Made with ❤️ by [SourceXXL](https://github.com/SourceXXL)**

Building transparent, direct humanitarian aid one transaction at a time.

[⭐ Star us on GitHub](https://github.com/SourceXXL/alian_structure-UI) • [🤝 Contribute](./CONTRIBUTING.md) • [📧 Contact](mailto:support@alianstructure.com)

</div>
