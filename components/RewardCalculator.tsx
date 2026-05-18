"use client";

import React from "react";
import {
  PRIORITY_REWARDS,
  CATEGORY_MULTIPLIERS,
  BUG_CATEGORIES,
  PRIORITY_LEVELS,
  type RewardCalculation,
} from "../types/bug-report";

interface RewardCalculatorProps {
  priority: "low" | "medium" | "high" | "critical";
  category: "ui" | "functionality" | "performance" | "security" | "other";
  onRewardChange?: (reward: RewardCalculation) => void;
}

export const RewardCalculator: React.FC<RewardCalculatorProps> = ({
  priority,
  category,
  onRewardChange,
}) => {
  const calculateReward = React.useMemo((): RewardCalculation => {
    const baseReward = PRIORITY_REWARDS[priority];
    const priorityMultiplier = 1;
    const categoryMultiplier = CATEGORY_MULTIPLIERS[category];
    const totalReward = Math.round(
      baseReward * priorityMultiplier * categoryMultiplier,
    );

    const estimatedPayoutDate = new Date();
    estimatedPayoutDate.setDate(estimatedPayoutDate.getDate() + 7);

    return {
      baseReward,
      priorityMultiplier,
      categoryMultiplier,
      totalReward,
      estimatedPayoutDate: estimatedPayoutDate.toISOString(),
    };
  }, [priority, category]);

  React.useEffect(() => {
    onRewardChange?.(calculateReward);
  }, [calculateReward, onRewardChange]);

  const selectedPriority = PRIORITY_LEVELS.find((p) => p.value === priority);
  const selectedCategory = BUG_CATEGORIES.find((c) => c.value === category);

  return (
    <div className="bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg p-6 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4 text-cosmic-blue">
        Reward Estimation
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Base Reward:</span>
          <span className="text-white font-medium">
            {calculateReward.baseReward} XLM
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300">Category Multiplier:</span>
          <span className="text-white font-medium">
            ×{calculateReward.categoryMultiplier}
          </span>
        </div>

        <div className="border-t border-cosmic-purple/30 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Estimated Reward:</span>
            <span className="text-2xl font-bold text-cosmic-blue">
              {calculateReward.totalReward} XLM
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          <p>
            Priority: {selectedPriority?.label} -{" "}
            {selectedPriority?.description}
          </p>
          <p>Category: {selectedCategory?.label}</p>
          <p className="mt-2">
            Estimated payout:{" "}
            {new Date(calculateReward.estimatedPayoutDate).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-cosmic-purple/20 rounded p-3 mt-4">
          <p className="text-xs text-gray-300">
            Rewards are paid in XLM and subject to review. Higher priority and
            security issues receive higher rewards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RewardCalculator;
