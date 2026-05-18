import { MultiAssetStakingEngine } from "@/lib/staking/engine";
import { TokenInterface } from "@/lib/staking/types";

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

const engine = new MultiAssetStakingEngine({
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

engine.stake("alice", "xlm", 100, 0);
engine.stake("bob", "usdc", 50, 0);

const supportedAssets = engine.getSupportedAssets().map((asset) => ({
  ...asset,
  emissionPerSecond: engine.getAssetEmissionRate(asset.id),
}));

const previewAtTenSeconds = [
  {
    userId: "alice",
    assetId: "xlm",
    symbol: xlmToken.symbol,
    reward: engine.previewRewards("alice", "xlm", 10_000),
  },
  {
    userId: "bob",
    assetId: "usdc",
    symbol: usdcToken.symbol,
    reward: engine.previewRewards("bob", "usdc", 10_000),
  },
];

const poolData = supportedAssets.map((asset) => ({
  assetId: asset.id,
  token: asset.token,
  rewardWeight: asset.rewardWeight,
  multiplier: asset.stakeMultiplier ?? 1,
  emissionPerSecond: asset.emissionPerSecond,
}));

export default function StakingPage() {
  return (
    <main className="pt-24 pb-16 min-h-screen bg-cosmic-dark">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-cosmic-purple/30 bg-cosmic-purple/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cosmic-purple">
            Multi-asset staking
          </div>
          <h1 className="text-4xl md:text-6xl font-bold glow-text leading-tight">
            Stake multiple tokens through one rewards pool.
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            This staking layer accepts SEP-41 style token interfaces, normalizes each
            asset with a configurable multiplier, and splits reward emissions across
            supported tokens without hard-coding a single asset.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-cosmic-purple/20 bg-cosmic-dark/50 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cosmic-purple/80 mb-2">
              Reward token
            </p>
            <h2 className="text-2xl font-bold text-white">{rewardToken.symbol}</h2>
            <p className="text-sm text-gray-400 mt-2">
              Rewards accrue in {rewardToken.name} across all supported staking assets.
            </p>
          </div>
          <div className="rounded-2xl border border-cosmic-purple/20 bg-cosmic-dark/50 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cosmic-purple/80 mb-2">
              Emission rate
            </p>
            <h2 className="text-2xl font-bold text-white">90 / sec</h2>
            <p className="text-sm text-gray-400 mt-2">
              Allocated to each token pool by reward weight.
            </p>
          </div>
          <div className="rounded-2xl border border-cosmic-purple/20 bg-cosmic-dark/50 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cosmic-purple/80 mb-2">
              Token interface
            </p>
            <h2 className="text-2xl font-bold text-white">SEP-41 ready</h2>
            <p className="text-sm text-gray-400 mt-2">
              Each asset is described through token metadata and standard token methods.
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Supported assets</h2>
          <div className="overflow-hidden rounded-2xl border border-cosmic-purple/20 bg-cosmic-dark/40">
            <table className="w-full text-left">
              <thead className="bg-cosmic-dark/60 text-xs uppercase tracking-[0.2em] text-gray-400">
                <tr>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3">Reward Weight</th>
                  <th className="px-4 py-3">Stake Multiplier</th>
                  <th className="px-4 py-3">Emission / sec</th>
                  <th className="px-4 py-3">Minimum</th>
                </tr>
              </thead>
              <tbody>
                {supportedAssets.map((asset) => (
                  <tr key={asset.id} className="border-t border-cosmic-purple/10">
                    <td className="px-4 py-3 font-semibold text-white">{asset.id}</td>
                    <td className="px-4 py-3 text-gray-300">{asset.token.symbol}</td>
                    <td className="px-4 py-3 text-gray-300">{asset.rewardWeight}</td>
                    <td className="px-4 py-3 text-gray-300">{asset.stakeMultiplier ?? 1}x</td>
                    <td className="px-4 py-3 text-gray-300">{asset.emissionPerSecond}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {asset.minStake ?? 0} {asset.token.symbol}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-cosmic-purple/20 bg-cosmic-dark/40 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Reward split</h2>
            <div className="space-y-4">
              {poolData.map((pool) => (
                <div
                  key={pool.assetId}
                  className="rounded-xl border border-cosmic-purple/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{pool.token.symbol}</h3>
                      <p className="text-sm text-gray-400">
                        Weight {pool.rewardWeight} and multiplier {pool.multiplier}x
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                        Emission
                      </p>
                      <p className="text-lg font-bold text-cosmic-cyan">
                        {pool.emissionPerSecond} / sec
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-cosmic-purple/20 bg-cosmic-dark/40 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Ten second preview</h2>
            <div className="space-y-4">
              {previewAtTenSeconds.map((entry) => (
                <div
                  key={`${entry.userId}-${entry.assetId}`}
                  className="flex items-center justify-between rounded-xl border border-cosmic-purple/10 bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white capitalize">{entry.userId}</p>
                    <p className="text-sm text-gray-400">{entry.symbol} position</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Reward preview
                    </p>
                    <p className="text-lg font-bold text-cosmic-purple">
                      {entry.reward.toFixed(2)} {rewardToken.symbol}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
