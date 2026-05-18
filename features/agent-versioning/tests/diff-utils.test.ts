import { compareSchemas } from '../lib/diff-utils';
import { ContractStateSchema } from '../types';

describe('Schema Diff Utilities', () => {
  const baseSchema: ContractStateSchema = {
    fields: {
      "userBalance": "i128",
      "adminAddress": "address"
    }
  };

  it('should detect no changes when schemas are identical', () => {
    const result = compareSchemas(baseSchema, { ...baseSchema });
    expect(result.hasChanges).toBe(false);
    expect(result.hasBreakingChanges).toBe(false);
  });

  it('should detect safe changes (additions only)', () => {
    const newSchema: ContractStateSchema = {
      fields: {
        "userBalance": "i128",
        "adminAddress": "address",
        "lastUpdated": "u64" // New field added
      }
    };
    const result = compareSchemas(baseSchema, newSchema);
    expect(result.hasChanges).toBe(true);
    expect(result.hasBreakingChanges).toBe(false); // Adding fields is safe
  });

  it('should detect breaking changes (removals)', () => {
    const newSchema: ContractStateSchema = {
      fields: {
        "userBalance": "i128"
        // adminAddress removed!
      }
    };
    const result = compareSchemas(baseSchema, newSchema);
    expect(result.hasChanges).toBe(true);
    expect(result.hasBreakingChanges).toBe(true); // Removing fields breaks existing state
  });

  it('should detect breaking changes (type changes)', () => {
    const newSchema: ContractStateSchema = {
      fields: {
        "userBalance": "i64", // Changed from i128 to i64
        "adminAddress": "address"
      }
    };
    const result = compareSchemas(baseSchema, newSchema);
    expect(result.hasChanges).toBe(true);
    expect(result.hasBreakingChanges).toBe(true); // Modifying an existing key counts as a removal of the old key-value pair
  });
});