import { MultiAssetStakingEngine, validateTokenInterfaces } from "../../lib/staking";
import type { TokenInterface } from "../../lib/staking/types";

const rewardToken: TokenInterface = {
  contractId: "REWARD",
  name: "stellAI Rewards",
  symbol: "sAI",
  decimals: 7,
};

const xlmToken: TokenInterface = {
  contractId: "XLM",
  name: "Stellar Lumens",
  symbol: "XLM",
  decimals: 7,
};

const usdcToken: TokenInterface = {
  contractId: "USDC",
  name: "USD Coin",
  symbol: "USDC",
  decimals: 6,
};

function buildEngine() {
  return new MultiAssetStakingEngine({
    rewardToken,
    emissionPerSecond: 90,
    assets: [
      {
        id: "xlm",
        token: xlmToken,
        rewardWeight: 2,
        stakeMultiplier: 1,
        minStake: 10,
      },
      {
        id: "usdc",
        token: usdcToken,
        rewardWeight: 1,
        stakeMultiplier: 1.5,
        minStake: 5,
      },
    ],
  });
}

describe("MultiAssetStakingEngine", () => {
  it("supports multiple assets through token interfaces", () => {
    const engine = buildEngine();

    expect(engine.getSupportedAssets()).toHaveLength(2);
    expect(engine.getAssetEmissionRate("xlm")).toBe(60);
    expect(engine.getAssetEmissionRate("usdc")).toBe(30);
  });

  it("accrues rewards independently for each staked token", () => {
    const engine = buildEngine();

    engine.stake("alice", "xlm", 100, 0);
    engine.stake("bob", "usdc", 50, 0);

    expect(engine.previewRewards("alice", "xlm", 10_000)).toBeCloseTo(600, 6);
    expect(engine.previewRewards("bob", "usdc", 10_000)).toBeCloseTo(300, 6);
  });

  it("updates rewards when unstaking and claiming", () => {
    const engine = buildEngine();

    engine.stake("alice", "xlm", 100, 0);

    const unstakeResult = engine.unstake("alice", "xlm", 40, 10_000);
    expect(unstakeResult.pendingRewards).toBeCloseTo(600, 6);
    expect(unstakeResult.position?.stakedAmount).toBe(60);

    const claimResult = engine.claimRewards("alice", "xlm", 10_000);
    expect(claimResult.rewardClaimed).toBeCloseTo(600, 6);
    expect(engine.previewRewards("alice", "xlm", 20_000)).toBeCloseTo(600, 6);
  });

  it("rejects unsupported assets", () => {
    const engine = buildEngine();

    expect(() => engine.stake("alice", "doge", 10, 0)).toThrow(
      "Unsupported staking asset: doge"
    );
  });

  it("validates token interface metadata", () => {
    expect(() =>
      validateTokenInterfaces(
        { contractId: "R", name: "Reward", symbol: "RWD", decimals: 7 },
        [
          {
            id: "broken",
            token: { contractId: "", name: "", symbol: "", decimals: -1 } as TokenInterface,
            rewardWeight: 1,
          },
        ]
      )
    ).toThrow("Asset broken must implement the token interface");
  });
});
