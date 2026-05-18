export interface TokenInterface {
  contractId: string;
  name: string;
  symbol: string;
  decimals: number;
  balance?: (accountId: string) => Promise<string | number> | string | number;
  transfer?: (params: {
    from: string;
    to: string;
    amount: string | number;
  }) => Promise<unknown> | unknown;
  transferFrom?: (params: {
    spender: string;
    from: string;
    to: string;
    amount: string | number;
  }) => Promise<unknown> | unknown;
  approve?: (params: {
    owner: string;
    spender: string;
    amount: string | number;
  }) => Promise<unknown> | unknown;
  allowance?: (
    owner: string,
    spender: string
  ) => Promise<string | number> | string | number;
}

export interface StakeableAssetConfig {
  id: string;
  token: TokenInterface;
  rewardWeight: number;
  stakeMultiplier?: number;
  minStake?: number;
}

export interface StakingPoolConfig {
  rewardToken: TokenInterface;
  emissionPerSecond: number;
  assets: StakeableAssetConfig[];
}

export interface AssetPoolState {
  assetId: string;
  totalEffectiveStake: number;
  accRewardPerShare: number;
  lastUpdatedAt: number;
  emissionPerSecond: number;
}

export interface StakePosition {
  userId: string;
  assetId: string;
  stakedAmount: number;
  effectiveStake: number;
  rewardDebt: number;
  pendingRewards: number;
  lastUpdatedAt: number;
}

export interface StakeActionResult {
  userId: string;
  assetId: string;
  amount: number;
  rewardClaimed: number;
  pendingRewards: number;
  position: StakePosition | null;
}

export interface PortfolioSummary {
  userId: string;
  totalStaked: number;
  totalEffectiveStake: number;
  totalPendingRewards: number;
  positions: StakePosition[];
}

export function isTokenInterface(value: unknown): value is TokenInterface {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TokenInterface>;

  return (
    typeof candidate.contractId === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.symbol === "string" &&
    typeof candidate.decimals === "number" &&
    candidate.decimals >= 0
  );
}
