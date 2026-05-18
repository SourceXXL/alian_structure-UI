# Stellar Wallet Components

This directory contains the React components for Stellar wallet integration in the stellAIverse application.

## Components Overview

### 📱 ConnectWallet.tsx

Button component for wallet connection with dropdown menu.

**Props:**
- `className?: string` - Additional CSS classes

**Features:**
- Dropdown menu with Freighter, Albedo, Ledger options
- Loading state during connection
- Error message display
- Only shows when wallet not connected

**Usage:**
```tsx
import ConnectWallet from '@/components/ConnectWallet';

export default function App() {
  return <ConnectWallet className="mx-4" />;
}
```

### 💼 WalletAddress.tsx

Display component for connected wallet address and balances.

**Props:**
- `showBalance?: boolean` - Whether to show balance (default: true)
- `className?: string` - Additional CSS classes

**Features:**
- Truncated address display (GAAA...ZZZZ)
- Balance display with asset breakdown
- Dropdown menu with full address
- Copy-to-clipboard functionality
- Disconnect button
- Only shows when wallet is connected

**Usage:**
```tsx
import WalletAddress from '@/components/WalletAddress';

export default function App() {
  return <WalletAddress showBalance={true} />;
}
```

### 🌐 NetworkSwitcher.tsx

Network selection component for Stellar network switching.

**Props:**
- `className?: string` - Additional CSS classes

**Features:**
- Dropdown menu with Mainnet, Testnet, Futurenet
- Visual network indicators (🟦🟨🟪)
- Current network highlighting
- Network details in dropdown
- Works independently of wallet connection

**Usage:**
```tsx
import NetworkSwitcher from '@/components/NetworkSwitcher';

export default function App() {
  return <NetworkSwitcher />;
}
```

### 🔐 context/StellarWalletProvider.tsx

React Context provider for global wallet state management.

**Provided Context (`useStellarWallet()`):**
- `wallet: StellarWallet | null` - Current wallet info
- `network: StellarNetwork` - Current network
- `isConnecting: boolean` - Loading state
- `error: string | null` - Error message
- `connectWallet(type): Promise<void>` - Connect wallet
- `disconnectWallet(): void` - Disconnect wallet
- `switchNetwork(network): Promise<void>` - Switch network
- `getBalance(): Promise<WalletBalance[]>` - Fetch balance
- `clearError(): void` - Clear error state

**Usage:**
```tsx
import { useStellarWallet } from '@/components/context/StellarWalletProvider';

export default function MyComponent() {
  const { wallet, connectWallet } = useStellarWallet();
  
  // Use wallet state and methods
}
```

## Integration with Navigation

All wallet components are integrated into the main Navigation component:

```tsx
import ConnectWallet from './ConnectWallet';
import WalletAddress from './WalletAddress';
import NetworkSwitcher from './NetworkSwitcher';

export function Navigation() {
  return (
    <nav>
      {/* ... other nav items ... */}
      
      <div className="hidden md:flex gap-3 items-center">
        <NetworkSwitcher />
        <ConnectWallet />
        <WalletAddress />
      </div>
    </nav>
  );
}
```

## State Management

Wallet state is managed globally via React Context and persisted to localStorage:

```
├─ Wallet State (Context)
│  ├─ wallet: StellarWallet
│  ├─ network: StellarNetwork
│  ├─ isConnecting: boolean
│  └─ error: string | null
│
└─ localStorage Persistence
   ├─ stellar_wallet_address
   ├─ stellar_wallet_type
   ├─ stellar_network
   └─ stellar_wallet_state
```

## Error Handling

Each component handles errors gracefully:

- **ConnectWallet**: Displays error in dropdown
- **WalletAddress**: Only shown when connected
- **NetworkSwitcher**: Handles network switching errors
- **StellarWalletProvider**: Manages all error states

## Styling

All components use Tailwind CSS and match the cosmic theme:

- **Colors**: Cyan (🟦), Yellow (🟨), Purple (🟪)
- **Border**: Cosmic purple with opacity
- **Background**: Dark cosmic colors
- **Transitions**: Smooth hover effects
- **Responsive**: Mobile-friendly design

## Type Safety

All components are fully typed with TypeScript:

```tsx
interface ConnectWalletProps {
  className?: string;
}

interface WalletAddressProps {
  showBalance?: boolean;
  className?: string;
}

interface NetworkSwitcherProps {
  className?: string;
}
```

## Examples

### Basic Usage

```tsx
'use client';

import ConnectWallet from '@/components/ConnectWallet';
import WalletAddress from '@/components/WalletAddress';
import NetworkSwitcher from '@/components/NetworkSwitcher';

export default function Page() {
  return (
    <div className="flex gap-4">
      <NetworkSwitcher />
      <ConnectWallet />
      <WalletAddress showBalance={true} />
    </div>
  );
}
```

### Advanced Usage with Hook

```tsx
'use client';

import { useStellarWallet } from '@/components/context/StellarWalletProvider';

export default function Dashboard() {
  const { wallet, network, connectWallet, error } = useStellarWallet();

  return (
    <div>
      {wallet?.isConnected ? (
        <>
          <h1>Welcome {wallet.publicKey}</h1>
          <p>Connected on {network}</p>
          <p>Balance: {wallet.balances[0]?.balance} XLM</p>
        </>
      ) : (
        <div>
          <p>Please connect your wallet</p>
          <button onClick={() => connectWallet('freighter')}>
            Connect Freighter
          </button>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### Transaction Example

```tsx
'use client';

import { useStellarWallet } from '@/components/context/StellarWalletProvider';
import * as StellarSdk from '@stellar/stellar-sdk';
import { getStellarServer, getNetworkPassphrase, signTransactionWithFreighter } from '@/lib/stellar';

async function sendPayment(dest: string, amount: string) {
  const { wallet, network } = useStellarWallet();

  if (!wallet?.isConnected) return;

  const server = getStellarServer(network);
  const account = await server.loadAccount(wallet.publicKey);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(network),
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: dest,
        asset: StellarSdk.Asset.native(),
        amount,
      })
    )
    .setTimeout(30)
    .build();

  const result = await signTransactionWithFreighter(tx, network);
  
  if (result.success) {
    console.log('Transaction signed!');
  }
}
```

## Testing

Each component has comprehensive tests:

- Unit tests: `tests/__tests__/wallet.test.tsx`
- Integration tests: `tests/__tests__/network.test.tsx`
- E2E tests: `tests/e2e/wallet.e2e.test.tsx`

Run tests with:
```bash
npm test                    # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

## Accessibility

Components follow accessibility best practices:

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliant
- Focus indicators visible

## Performance

- Memoized components where applicable
- Efficient state updates
- Lazy loading of wallet data
- Optimized re-renders
- Minimal bundle size

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

(Required for modern JavaScript features and wallet extensions)

## Troubleshooting

### Component not appearing
- Check that `StellarWalletProvider` wraps your app
- Verify localStorage is enabled
- Check browser console for errors

### Wallet connection failing
- Ensure wallet extension is installed
- Check wallet is unlocked
- Try switching networks

### Balance not showing
- Check network connection
- Try refreshing balance
- Verify account has XLM

## Related Files

- [lib/stellar.ts](../lib/stellar.ts) - Core utilities
- [lib/stellar-constants.ts](../lib/stellar-constants.ts) - Configuration
- [STELLAR_WALLET_INTEGRATION.md](../STELLAR_WALLET_INTEGRATION.md) - Full guide
- [STELLAR_QUICK_START.md](../STELLAR_QUICK_START.md) - Quick start

## Support

For issues, see:
1. [STELLAR_QUICK_START.md](../STELLAR_QUICK_START.md#troubleshooting)
2. [STELLAR_WALLET_INTEGRATION.md](../STELLAR_WALLET_INTEGRATION.md#troubleshooting)
3. Check test files for usage examples
4. Review component prop types

---

**These components are production-ready and fully tested. Enjoy! 🚀**
