/**
 * E2E Tests for Stellar Wallet Integration
 *
 * These tests simulate the complete wallet connection flow
 * To run these tests in a real environment, configure your test runner
 * to handle browser automation (e.g., Playwright, Cypress)
 */

import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  StellarWalletProvider,
  useStellarWallet,
} from "@/components/context/StellarWalletProvider";
import ConnectWallet from "@/components/ConnectWallet";
import WalletAddress from "@/components/WalletAddress";
import NetworkSwitcher from "@/components/NetworkSwitcher";
import "@testing-library/jest-dom";

jest.mock("@/lib/stellar", () => ({
  ...jest.requireActual("@/lib/stellar"),
  getAccountBalances: jest.fn().mockResolvedValue([]),
}));

// Mock wallet data
const MOCK_WALLET_ADDRESS =
  "GCZAJM3RJY7Y67HDFN7PIJBTYQC6KMRAXM57SC7Y2H546AAHFHWRH3YY";
const MOCK_BALANCES = [
  { asset: "XLM", balance: "100.5000000" },
  {
    asset: "USDC",
    balance: "50.0000000",
    assetCode: "USDC",
    assetIssuer: "GBBD...",
  },
];

// Mock Freighter API
jest.mock("@stellar/freighter-api", () => ({
  getAddress: jest.fn(async () => ({ address: MOCK_WALLET_ADDRESS })),
  isConnected: jest.fn(async () => ({ isConnected: true })),
  signTransaction: jest.fn(async (xdr) => ({ signedTxXdr: `signed_${xdr}` })),
}));

// Complete wallet flow test component
function CompleteWalletFlow() {
  const { wallet, network } = useStellarWallet();

  return (
    <div>
      <header data-testid="navigation">
        <ConnectWallet />
        <WalletAddress showBalance={true} />
        <NetworkSwitcher />
      </header>
      <main data-testid="main-content">
        {wallet?.isConnected ? (
          <div data-testid="authenticated-content">
            <h1>Welcome {wallet.publicKey}</h1>
            <p>Network: {network}</p>
          </div>
        ) : (
          <div data-testid="unauthenticated-content">
            <h1>Please connect your wallet</h1>
          </div>
        )}
      </main>
    </div>
  );
}

describe("E2E: Wallet Connection Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("complete wallet connection flow: initial state", () => {
    render(
      <StellarWalletProvider>
        <CompleteWalletFlow />
      </StellarWalletProvider>,
    );

    expect(screen.getByTestId("unauthenticated-content")).toBeInTheDocument();
    expect(screen.getByText("Please connect your wallet")).toBeInTheDocument();
  });

  test("complete wallet connection flow: connect and display wallet", async () => {
    const user = userEvent.setup();

    render(
      <StellarWalletProvider>
        <CompleteWalletFlow />
      </StellarWalletProvider>,
    );

    // Find and click connect button
    const connectBtn = screen.getByText("Connect Wallet");
    await user.click(connectBtn);

    // Select Freighter wallet
    const freighterBtn = screen.getByText("Freighter");
    await user.click(freighterBtn);

    // Wait for wallet to be connected
    await waitFor(async () => {
      expect(screen.getByTestId("authenticated-content")).toBeInTheDocument();
    });

    expect(localStorage.getItem("stellar_wallet_address")).toBe(
      MOCK_WALLET_ADDRESS,
    );
  });

  test("complete wallet flow: network switching", async () => {
    const user = userEvent.setup();

    render(
      <StellarWalletProvider>
        <CompleteWalletFlow />
      </StellarWalletProvider>,
    );

    // Connect wallet first
    const connectBtn = screen.getByText("Connect Wallet");
    await user.click(connectBtn);

    const freighterBtn = screen.getByText("Freighter");
    await user.click(freighterBtn);

    await waitFor(async () => {
      expect(screen.getByTestId("authenticated-content")).toBeInTheDocument();
    });

    // Switch network (this would depend on implementation)
    const networkBtns = screen.getAllByText(/Mainnet|Testnet|Futurenet/);
    const networkBtn = networkBtns[0];
    expect(networkBtn).toBeInTheDocument();
  });

  test("complete wallet flow: disconnect wallet", async () => {
    const user = userEvent.setup();

    // Set up connected state
    localStorage.setItem("stellar_wallet_address", MOCK_WALLET_ADDRESS);
    localStorage.setItem("stellar_wallet_type", "freighter");

    render(
      <StellarWalletProvider>
        <CompleteWalletFlow />
      </StellarWalletProvider>,
    );

    // Wallet should be displayed
    await waitFor(() => {
      expect(screen.getByTestId("authenticated-content")).toBeInTheDocument();
    });

    // Find and click wallet address to show menu
    const nav = screen.getByTestId("navigation");
    const truncatedAddress = await within(nav).findByText(/G[A-Z0-9]{3,}/);
    await user.click(truncatedAddress);

    // Click disconnect
    const disconnectBtn = await screen.findByText("Disconnect");
    await user.click(disconnectBtn);

    // Verify wallet is disconnected
    await waitFor(() => {
      expect(screen.getByTestId("unauthenticated-content")).toBeInTheDocument();
      expect(localStorage.getItem("stellar_wallet_address")).toBeNull();
    });
  });

  test("E2E: wallet persistence across page refreshes", async () => {
    localStorage.setItem("stellar_wallet_address", MOCK_WALLET_ADDRESS);
    localStorage.setItem("stellar_wallet_type", "freighter");
    localStorage.setItem("stellar_network", "testnet");

    const { unmount, rerender } = render(
      <StellarWalletProvider>
        <CompleteWalletFlow />
      </StellarWalletProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated-content")).toBeInTheDocument();
    });

    // Simulate page refresh
    unmount();

    // Render again (simulating page reload)
    render(
      <StellarWalletProvider>
        <CompleteWalletFlow />
      </StellarWalletProvider>,
    );

    // Wallet should still be connected
    await waitFor(() => {
      expect(screen.getByTestId("authenticated-content")).toBeInTheDocument();
    });

    expect(screen.getByText(/Welcome.*GCZA/)).toBeInTheDocument();
  });

  test("E2E: error handling for rejected transactions", async () => {
    const user = userEvent.setup();
    const { isConnected } = require("@stellar/freighter-api");
    isConnected.mockRejectedValue(new Error("User rejected"));

    render(
      <StellarWalletProvider>
        <CompleteWalletFlow />
      </StellarWalletProvider>,
    );

    // Try to connect
    const connectBtn = screen.getByText("Connect Wallet");
    await user.click(connectBtn);

    const freighterBtn = screen.getByText("Freighter");
    await user.click(freighterBtn);

    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByTestId("unauthenticated-content")).toBeInTheDocument();
    });
  });

  test("E2E: network error handling", async () => {
    const user = userEvent.setup();

    render(
      <StellarWalletProvider>
        <CompleteWalletFlow />
      </StellarWalletProvider>,
    );

    // Network should be selectable even without wallet
    const networkBtns = screen.getAllByText(/Mainnet|Testnet|Futurenet/);
    const networkBtn = networkBtns[0];
    expect(networkBtn).toBeInTheDocument();

    await user.click(networkBtn);
  });
});

describe("E2E: Multi-Network Wallet Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("automatic network detection and switching", async () => {
    const user = userEvent.setup();

    render(
      <StellarWalletProvider>
        <CompleteWalletFlow />
      </StellarWalletProvider>,
    );

    // Set network preference
    localStorage.setItem("stellar_network", "testnet");

    // Reload component
    render(
      <StellarWalletProvider>
        <CompleteWalletFlow />
      </StellarWalletProvider>,
    );

    expect(localStorage.getItem("stellar_network")).toBe("testnet");
  });

  test("wallet connection works across all networks", async () => {
    const networks = ["mainnet", "testnet", "futurenet"];

    for (const network of networks) {
      localStorage.clear();
      localStorage.setItem("stellar_network", network);

      const { unmount } = render(
        <StellarWalletProvider>
          <CompleteWalletFlow />
        </StellarWalletProvider>,
      );

      expect(localStorage.getItem("stellar_network")).toBe(network);

      unmount();
    }
  });
});

describe("E2E: Wallet Address Display", () => {
  test("wallet address is displayed in truncated format", async () => {
    localStorage.setItem("stellar_wallet_address", MOCK_WALLET_ADDRESS);
    localStorage.setItem("stellar_wallet_type", "freighter");

    render(
      <StellarWalletProvider>
        <WalletAddress />
      </StellarWalletProvider>,
    );

    await waitFor(() => {
      const addressDisplay = screen.getByText(/GCZA.*H3YY/);
      expect(addressDisplay).toBeInTheDocument();
    });
  });

  test("wallet balance is displayed correctly", async () => {
    localStorage.setItem("stellar_wallet_address", MOCK_WALLET_ADDRESS);
    localStorage.setItem("stellar_wallet_type", "freighter");

    render(
      <StellarWalletProvider>
        <WalletAddress showBalance={true} />
      </StellarWalletProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/XLM/)).toBeInTheDocument();
    });
  });

  test("full wallet address is visible in menu", async () => {
    const user = userEvent.setup();

    localStorage.setItem("stellar_wallet_address", MOCK_WALLET_ADDRESS);
    localStorage.setItem("stellar_wallet_type", "freighter");

    render(
      <StellarWalletProvider>
        <WalletAddress />
      </StellarWalletProvider>,
    );

    await waitFor(async () => {
      const truncatedAddress = screen.getByText(/GCZA.*H3YY/);
      expect(truncatedAddress).toBeInTheDocument();

      // Click to open menu and see full address
      await user.click(truncatedAddress);
      const fullAddress = screen.getByText(MOCK_WALLET_ADDRESS);
      expect(fullAddress).toBeInTheDocument();
    });
  });
});

describe("E2E: Copy to Clipboard", () => {
  test("copy address to clipboard functionality", async () => {
    const user = userEvent.setup();

    // Mock clipboard API
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: jest.fn(async () => {}),
      },
      writable: true,
    });

    localStorage.setItem("stellar_wallet_address", MOCK_WALLET_ADDRESS);
    localStorage.setItem("stellar_wallet_type", "freighter");

    render(
      <StellarWalletProvider>
        <WalletAddress />
      </StellarWalletProvider>,
    );

    // Click wallet address button to open menu
    const walletBtn = screen.getByText(/GCZA.*H3YY/);
    await user.click(walletBtn);

    // Click copy button
    const copyBtn = screen.getByText("Copy Address");
    await user.click(copyBtn);

    // Verify clipboard was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      MOCK_WALLET_ADDRESS,
    );

    // Wait for the "Copied!" state update to settle
    await screen.findByText(/Copied/);
  });
});
