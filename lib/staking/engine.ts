import {
  AssetPoolState,
  PortfolioSummary,
  StakeActionResult,
  StakePosition,
  StakeableAssetConfig,
  StakingPoolConfig,
  TokenInterface,
  isTokenInterface,
} from "./types";

const DEFAULT_STAKE_MULTIPLIER = 1;

function toNumber(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Stake amount must be a positive number");
  }

  return parsed;
}

function clonePosition(position: StakePosition | null | undefined): StakePosition | null {
  return position ? { ...position } : null;
}

export function validateTokenInterfaces(
  rewardToken: TokenInterface,
  assets: StakeableAssetConfig[]
): void {
  if (!isTokenInterface(rewardToken)) {
    throw new Error("Reward token must implement the token interface");
  }

  for (const asset of assets) {
    if (!isTokenInterface(asset.token)) {
      throw new Error(`Asset ${asset.id} must implement the token interface`);
    }
  }
}

export class MultiAssetStakingEngine {
  private readonly assets = new Map<string, StakeableAssetConfig>();

  private readonly pools = new Map<string, AssetPoolState>();

  private readonly positions = new Map<string, Map<string, StakePosition>>();

  private readonly totalRewardWeight: number;

  constructor(private readonly config: StakingPoolConfig) {
    if (config.emissionPerSecond <= 0) {
      throw new Error("Emission per second must be greater than zero");
    }

    if (config.assets.length === 0) {
      throw new Error("At least one staking asset is required");
    }

    validateTokenInterfaces(config.rewardToken, config.assets);

    const seenIds = new Set<string>();
    let weightSum = 0;

    for (const asset of config.assets) {
      if (seenIds.has(asset.id)) {
        throw new Error(`Duplicate staking asset id: ${asset.id}`);
      }

      if (asset.rewardWeight <= 0) {
        throw new Error(`Asset ${asset.id} must have a positive reward weight`);
      }

      if ((asset.stakeMultiplier ?? DEFAULT_STAKE_MULTIPLIER) <= 0) {
        throw new Error(`Asset ${asset.id} must have a positive stake multiplier`);
      }

      seenIds.add(asset.id);
      this.assets.set(asset.id, asset);
      this.pools.set(asset.id, {
        assetId: asset.id,
        totalEffectiveStake: 0,
        accRewardPerShare: 0,
        lastUpdatedAt: 0,
        emissionPerSecond: 0,
      });
      weightSum += asset.rewardWeight;
    }

    this.totalRewardWeight = weightSum;
  }

  getSupportedAssets(): StakeableAssetConfig[] {
    return Array.from(this.assets.values()).map((asset) => ({ ...asset }));
  }

  getAsset(assetId: string): StakeableAssetConfig {
    const asset = this.assets.get(assetId);

    if (!asset) {
      throw new Error(`Unsupported staking asset: ${assetId}`);
    }

    return asset;
  }

  getPool(assetId: string): AssetPoolState {
    const pool = this.pools.get(assetId);

    if (!pool) {
      throw new Error(`Unsupported staking asset: ${assetId}`);
    }

    return pool;
  }

  getAssetEmissionRate(assetId: string): number {
    return this.emissionForAsset(assetId);
  }

  getPosition(userId: string, assetId: string): StakePosition | null {
    return clonePosition(this.positions.get(userId)?.get(assetId));
  }

  getPortfolio(userId: string): PortfolioSummary {
    const now = Date.now();
    const userPositions = Array.from(this.positions.get(userId)?.values() ?? []).map((position) => ({
      ...position,
    }));

    return {
      userId,
      totalStaked: userPositions.reduce((sum, position) => sum + position.stakedAmount, 0),
      totalEffectiveStake: userPositions.reduce((sum, position) => sum + position.effectiveStake, 0),
      totalPendingRewards: userPositions.reduce((sum, position) => sum + this.previewRewards(userId, position.assetId, now), 0),
      positions: userPositions,
    };
  }

  stake(
    userId: string,
    assetId: string,
    amount: string | number,
    timestamp = Date.now()
  ): StakeActionResult {
    const stakeAmount = toNumber(amount);
    const asset = this.getAsset(assetId);

    if (asset.minStake && stakeAmount < asset.minStake) {
      throw new Error(`Minimum stake for ${assetId} is ${asset.minStake}`);
    }

    const pool = this.syncPool(assetId, timestamp);
    const position = this.getOrCreatePosition(userId, assetId, timestamp);

    this.accruePosition(position, pool);

    const effectiveStake = this.toEffectiveStake(asset, stakeAmount);
    position.stakedAmount += stakeAmount;
    position.effectiveStake += effectiveStake;
    pool.totalEffectiveStake += effectiveStake;
    position.rewardDebt = position.effectiveStake * pool.accRewardPerShare;
    position.lastUpdatedAt = timestamp;

    return {
      userId,
      assetId,
      amount: stakeAmount,
      rewardClaimed: 0,
      pendingRewards: position.pendingRewards,
      position: { ...position },
    };
  }

  unstake(
    userId: string,
    assetId: string,
    amount: string | number,
    timestamp = Date.now()
  ): StakeActionResult {
    const unstakeAmount = toNumber(amount);
    const asset = this.getAsset(assetId);
    const pool = this.syncPool(assetId, timestamp);
    const position = this.getExistingPosition(userId, assetId);

    this.accruePosition(position, pool);

    if (unstakeAmount > position.stakedAmount) {
      throw new Error(`Cannot unstake more than the deposited balance for ${assetId}`);
    }

    const effectiveStake = this.toEffectiveStake(asset, unstakeAmount);
    position.stakedAmount -= unstakeAmount;
    position.effectiveStake -= effectiveStake;
    pool.totalEffectiveStake -= effectiveStake;
    position.rewardDebt = position.effectiveStake * pool.accRewardPerShare;
    position.lastUpdatedAt = timestamp;

    if (position.stakedAmount === 0 && position.pendingRewards === 0) {
      this.positions.get(userId)?.delete(assetId);
    }

    return {
      userId,
      assetId,
      amount: unstakeAmount,
      rewardClaimed: 0,
      pendingRewards: position.pendingRewards,
      position: clonePosition(this.getPosition(userId, assetId)),
    };
  }

  claimRewards(
    userId: string,
    assetId: string,
    timestamp = Date.now()
  ): StakeActionResult {
    const pool = this.syncPool(assetId, timestamp);
    const position = this.getExistingPosition(userId, assetId);

    this.accruePosition(position, pool);

    const rewardClaimed = position.pendingRewards;
    position.pendingRewards = 0;
    position.rewardDebt = position.effectiveStake * pool.accRewardPerShare;
    position.lastUpdatedAt = timestamp;

    if (position.stakedAmount === 0) {
      this.positions.get(userId)?.delete(assetId);
    }

    return {
      userId,
      assetId,
      amount: 0,
      rewardClaimed,
      pendingRewards: position.pendingRewards,
      position: clonePosition(this.getPosition(userId, assetId)),
    };
  }

  previewRewards(userId: string, assetId: string, timestamp = Date.now()): number {
    const pool = this.previewPool(assetId, timestamp);
    const position = this.positions.get(userId)?.get(assetId);

    if (!position) {
      return 0;
    }

    return this.pendingRewardsFor(position, pool);
  }

  private getOrCreatePosition(
    userId: string,
    assetId: string,
    timestamp: number
  ): StakePosition {
    const userPositions = this.positions.get(userId) ?? new Map<string, StakePosition>();
    const existing = userPositions.get(assetId);

    if (existing) {
      return existing;
    }

    const position: StakePosition = {
      userId,
      assetId,
      stakedAmount: 0,
      effectiveStake: 0,
      rewardDebt: 0,
      pendingRewards: 0,
      lastUpdatedAt: timestamp,
    };

    userPositions.set(assetId, position);
    this.positions.set(userId, userPositions);
    return position;
  }

  private getExistingPosition(userId: string, assetId: string): StakePosition {
    const position = this.positions.get(userId)?.get(assetId);

    if (!position) {
      throw new Error(`No stake found for ${userId} on ${assetId}`);
    }

    return position;
  }

  private toEffectiveStake(asset: StakeableAssetConfig, amount: number): number {
    return amount * (asset.stakeMultiplier ?? DEFAULT_STAKE_MULTIPLIER);
  }

  private emissionForAsset(assetId: string): number {
    const asset = this.getAsset(assetId);
    return (
      this.config.emissionPerSecond *
      (asset.rewardWeight / this.totalRewardWeight)
    );
  }

  private syncPool(assetId: string, timestamp: number): AssetPoolState {
    const pool = this.getPool(assetId);
    const updated = this.updatePool({
      ...pool,
      emissionPerSecond: this.emissionForAsset(assetId),
    }, timestamp);
    this.pools.set(assetId, updated);
    return updated;
  }

  private previewPool(assetId: string, timestamp: number): AssetPoolState {
    return this.updatePool(
      {
        ...this.getPool(assetId),
        emissionPerSecond: this.emissionForAsset(assetId),
      },
      timestamp
    );
  }

  private updatePool(pool: AssetPoolState, timestamp: number): AssetPoolState {
    if (timestamp < pool.lastUpdatedAt) {
      throw new Error("Timestamp must not move backwards");
    }

    const elapsedSeconds = (timestamp - pool.lastUpdatedAt) / 1000;
    const nextPool = { ...pool, lastUpdatedAt: timestamp };

    if (elapsedSeconds > 0 && pool.totalEffectiveStake > 0) {
      nextPool.accRewardPerShare +=
        (elapsedSeconds * pool.emissionPerSecond) / pool.totalEffectiveStake;
    }

    return nextPool;
  }

  private pendingRewardsFor(
    position: StakePosition,
    pool: AssetPoolState
  ): number {
    return (
      position.pendingRewards +
      position.effectiveStake * pool.accRewardPerShare -
      position.rewardDebt
    );
  }

  private accruePosition(position: StakePosition, pool: AssetPoolState): void {
    position.pendingRewards = Math.max(
      0,
      this.pendingRewardsFor(position, pool)
    );
    position.rewardDebt = position.effectiveStake * pool.accRewardPerShare;
  }
}
