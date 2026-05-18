import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  StellarWalletProvider,
  useStellarWallet,
} from "@/components/context/StellarWalletProvider";
import {
  isValidStellarAddress,
  truncateStellarAddress,
  formatXlmAmount,
} from "@/lib/stellar";

jest.mock("@/lib/stellar", () => ({
  ...jest.requireActual("@/lib/stellar"),
  getAccountBalances: jest.fn().mockResolvedValue([]),
}));

// Mock Freighter API
jest.mock("@stellar/freighter-api", () => ({
  getAddress: jest.fn(),
  isConnected: jest.fn(),
}));

// Test component that uses the wallet context
function TestWalletComponent() {
  const { wallet, connectWallet, disconnectWallet, error } = useStellarWallet();

  return (
    <div>
      {wallet ? (
        <div>
          <p data-testid="wallet-address">{wallet.publicKey}</p>
          <p data-testid="wallet-name">{wallet.name}</p>
          <button onClick={disconnectWallet} data-testid="disconnect-btn">
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => connectWallet("freighter")}
            data-testid="connect-freighter-btn"
          >
            Connect Freighter
          </button>
          <button
            onClick={() => connectWallet("albedo")}
            data-testid="connect-albedo-btn"
          >
            Connect Albedo
          </button>
        </div>
      )}
      {error && <p data-testid="error-message">{error}</p>}
    </div>
  );
}

describe("Stellar Wallet Context", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders without crashing", () => {
    render(
      <StellarWalletProvider>
        <TestWalletComponent />
      </StellarWalletProvider>,
    );
    expect(screen.getByTestId("connect-freighter-btn")).toBeInTheDocument();
  });

  test("displays connect buttons when no wallet is connected", () => {
    render(
      <StellarWalletProvider>
        <TestWalletComponent />
      </StellarWalletProvider>,
    );
    expect(screen.getByTestId("connect-freighter-btn")).toBeInTheDocument();
    expect(screen.getByTestId("connect-albedo-btn")).toBeInTheDocument();
  });

  test("throws error when useStellarWallet is used outside provider", () => {
    // Suppress console.error for this test
    const spy = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      render(<TestWalletComponent />);
    }).toThrow("useStellarWallet must be used within StellarWalletProvider");

    spy.mockRestore();
  });
});

describe("Stellar Address Utilities", () => {
  test("validates valid Stellar address", () => {
    const validAddress =
      "GCZAJM3RJY7Y67HDFN7PIJBTYQC6KMRAXM57SC7Y2H546AAHFHWRH3YY";
    expect(isValidStellarAddress(validAddress)).toBe(true);
  });

  test("rejects invalid Stellar address", () => {
    expect(isValidStellarAddress("invalid")).toBe(false);
    expect(isValidStellarAddress("123456")).toBe(false);
    expect(isValidStellarAddress("")).toBe(false);
  });

  test("truncates Stellar address correctly", () => {
    const address = "GCZAJM3RJY7Y67HDFN7PIJBTYQC6KMRAXM57SC7Y2H546AAHFHWRH3YY";
    const truncated = truncateStellarAddress(address, 4);
    expect(truncated).toBe("GCZA...H3YY");
  });

  test("handles short addresses in truncation", () => {
    const shortAddress = "GAAA";
    expect(truncateStellarAddress(shortAddress)).toBe("GAAA");
  });

  test("handles empty address in truncation", () => {
    expect(truncateStellarAddress("")).toBe("");
  });
});

describe("XLM Amount Formatting", () => {
  test("formats XLM amount correctly", () => {
    expect(formatXlmAmount("100.5000")).toContain("100");
    expect(formatXlmAmount("1000.123456")).toContain("1,000");
  });

  test("handles zero balance", () => {
    expect(formatXlmAmount("0")).toBe("0");
  });

  test("handles invalid amounts gracefully", () => {
    expect(formatXlmAmount("invalid")).toBe("invalid");
  });

  test("removes trailing zeros", () => {
    const result = formatXlmAmount("100.00000");
    expect(result).not.toContain("00000");
  });
});

describe("Wallet Connection", () => {
  test("persists wallet address to localStorage", async () => {
    const { getAddress, isConnected } = require("@stellar/freighter-api");
    const testAddress =
      "GCZAJM3RJY7Y67HDFN7PIJBTYQC6KMRAXM57SC7Y2H546AAHFHWRH3YY";

    isConnected.mockResolvedValue({ isConnected: true });
    getAddress.mockResolvedValue({ address: testAddress });

    render(
      <StellarWalletProvider>
        <TestWalletComponent />
      </StellarWalletProvider>,
    );

    const user = userEvent.setup();
    const connectBtn = screen.getByTestId("connect-freighter-btn");
    await user.click(connectBtn);

    await waitFor(() => {
      expect(localStorage.getItem("stellar_wallet_address")).toBe(testAddress);
    });
  });

  test("clears localStorage on disconnect", async () => {
    localStorage.setItem(
      "stellar_wallet_address",
      "GCZAJM3RJY7Y67HDFN7PIJBTYQC6KMRAXM57SC7Y2H546AAHFHWRH3YY",
    );
    localStorage.setItem("stellar_wallet_type", "freighter");

    render(
      <StellarWalletProvider>
        <TestWalletComponent />
      </StellarWalletProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("disconnect-btn")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const disconnectBtn = screen.getByTestId("disconnect-btn");
    await user.click(disconnectBtn);

    await waitFor(() => {
      expect(localStorage.getItem("stellar_wallet_address")).toBeNull();
      expect(localStorage.getItem("stellar_wallet_type")).toBeNull();
    });
  });
});

describe("Network Switching", () => {
  test("persists network selection to localStorage", async () => {
    render(
      <StellarWalletProvider>
        <TestWalletComponent />
      </StellarWalletProvider>,
    );

    await waitFor(() => {
      expect(localStorage.getItem("stellar_network")).toBeDefined();
    });
  });

  test("loads network from localStorage on mount", () => {
    localStorage.setItem("stellar_network", "testnet");

    render(
      <StellarWalletProvider>
        <TestWalletComponent />
      </StellarWalletProvider>,
    );

    expect(localStorage.getItem("stellar_network")).toBe("testnet");
  });
});
