import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  StellarWalletProvider,
  useStellarWallet,
} from "@/components/context/StellarWalletProvider";
import * as stellarLib from "@/lib/stellar";
import { STELLAR_NETWORKS } from "@/lib/stellar-constants";

// Mock Stellar SDK
jest.mock("@stellar/stellar-sdk", () => ({
  Horizon: {
    Server: jest.fn(),
  },
  StrKey: {
    isValidEd25519PublicKey: jest.fn((addr) => addr.startsWith("G")),
  },
  TransactionEnvelope: {
    fromXDR: jest.fn(),
  },
}));

jest.mock("@/lib/stellar", () => ({
  ...jest.requireActual("@/lib/stellar"),
  getAccountBalances: jest.fn().mockResolvedValue([]),
}));

// Test component for network switching
function TestNetworkComponent() {
  const { network, switchNetwork, wallet } = useStellarWallet();

  return (
    <div>
      <p data-testid="current-network">{network}</p>
      <button
        onClick={() => switchNetwork("mainnet")}
        data-testid="switch-mainnet"
      >
        Mainnet
      </button>
      <button
        onClick={() => switchNetwork("testnet")}
        data-testid="switch-testnet"
      >
        Testnet
      </button>
      <button
        onClick={() => switchNetwork("futurenet")}
        data-testid="switch-futurenet"
      >
        Futurenet
      </button>
      {wallet && <p data-testid="wallet-connected">Connected</p>}
    </div>
  );
}

describe("Network Switching Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("displays current network", () => {
    render(
      <StellarWalletProvider>
        <TestNetworkComponent />
      </StellarWalletProvider>,
    );

    const currentNetwork = screen.getByTestId("current-network");
    expect(["mainnet", "testnet", "futurenet"]).toContain(
      currentNetwork.textContent,
    );
  });

  test("switches between networks", async () => {
    render(
      <StellarWalletProvider>
        <TestNetworkComponent />
      </StellarWalletProvider>,
    );

    const user = userEvent.setup();
    const switchTestnetBtn = screen.getByTestId("switch-testnet");
    await user.click(switchTestnetBtn);

    await waitFor(() => {
      expect(screen.getByTestId("current-network")).toHaveTextContent(
        "testnet",
      );
    });

    const switchMainnetBtn = screen.getByTestId("switch-mainnet");
    await user.click(switchMainnetBtn);

    await waitFor(() => {
      expect(screen.getByTestId("current-network")).toHaveTextContent(
        "mainnet",
      );
    });
  });

  test("persists network selection across rerenders", async () => {
    const { rerender } = render(
      <StellarWalletProvider>
        <TestNetworkComponent />
      </StellarWalletProvider>,
    );

    const user = userEvent.setup();
    const switchTestnetBtn = screen.getByTestId("switch-testnet");
    await user.click(switchTestnetBtn);

    await waitFor(() => {
      expect(localStorage.getItem("stellar_network")).toBe("testnet");
    });

    rerender(
      <StellarWalletProvider>
        <TestNetworkComponent />
      </StellarWalletProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-network")).toHaveTextContent(
        "testnet",
      );
    });
  });

  test("all three networks have correct configuration", () => {
    Object.entries(STELLAR_NETWORKS).forEach(([key, config]) => {
      expect(config.name).toBe(key);
      expect(config.displayName).toBeDefined();
      expect(config.horizonUrl).toBeDefined();
      expect(config.networkPassphrase).toBeDefined();
      expect(config.color).toBeDefined();
      expect(config.badge).toBeDefined();
    });
  });

  test("mainnet configuration is correct", () => {
    const mainnetConfig = STELLAR_NETWORKS.mainnet;
    expect(mainnetConfig.displayName).toBe("Mainnet");
    expect(mainnetConfig.horizonUrl).toContain("horizon.stellar.org");
    expect(mainnetConfig.networkPassphrase).toContain(
      "Public Global Stellar Network",
    );
  });

  test("testnet configuration is correct", () => {
    const testnetConfig = STELLAR_NETWORKS.testnet;
    expect(testnetConfig.displayName).toBe("Testnet");
    expect(testnetConfig.horizonUrl).toContain("testnet");
    expect(testnetConfig.networkPassphrase).toContain("Test SDF Network");
  });

  test("futurenet configuration is correct", () => {
    const futurenetConfig = STELLAR_NETWORKS.futurenet;
    expect(futurenetConfig.displayName).toBe("Futurenet");
    expect(futurenetConfig.horizonUrl).toContain("futurenet");
    expect(futurenetConfig.networkPassphrase).toContain("Future Network");
  });
});

describe("Network Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("handles network switching errors gracefully", async () => {
    // Correctly mock getAccountBalances
    (stellarLib.getAccountBalances as jest.Mock).mockImplementation(() => {
      throw new Error("Network error");
    });

    // This test verifies that the error handling doesn't crash the application
    render(
      <StellarWalletProvider>
        <TestNetworkComponent />
      </StellarWalletProvider>,
    );

    expect(screen.getByTestId("current-network")).toBeInTheDocument();
  });
});

describe("Horizon API Endpoints", () => {
  test("mainnet uses correct Horizon endpoint", () => {
    const mainnetConfig = STELLAR_NETWORKS.mainnet;
    expect(mainnetConfig.horizonUrl).toBe(
      process.env.NEXT_PUBLIC_STELLAR_MAINNET_URL ||
        "https://horizon.stellar.org",
    );
  });

  test("testnet uses correct Horizon endpoint", () => {
    const testnetConfig = STELLAR_NETWORKS.testnet;
    expect(testnetConfig.horizonUrl).toBe(
      process.env.NEXT_PUBLIC_STELLAR_TESTNET_URL ||
        "https://horizon-testnet.stellar.org",
    );
  });

  test("futurenet uses correct Horizon endpoint", () => {
    const futurenetConfig = STELLAR_NETWORKS.futurenet;
    expect(futurenetConfig.horizonUrl).toBe(
      process.env.NEXT_PUBLIC_STELLAR_FUTURENET_URL ||
        "https://horizon-futurenet.stellar.org",
    );
  });
});
