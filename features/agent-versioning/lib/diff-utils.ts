import { diffJson, Change } from 'diff';
import { ContractStateSchema } from '../types';

export interface SchemaDiffResult {
  hasChanges: boolean;
  hasBreakingChanges: boolean;
  changes: Change[];
}

/**
 * Compares two Soroban contract state schemas.
 * A breaking change in a schema is typically the REMOVAL of an existing field,
 * or a CHANGE in the type of an existing field. Adding new fields is usually safe.
 */
export const compareSchemas = (
  oldSchema: ContractStateSchema, 
  newSchema: ContractStateSchema
): SchemaDiffResult => {
  const differences = diffJson(oldSchema.fields, newSchema.fields);
  
  let hasChanges = false;
  let hasBreakingChanges = false;

  differences.forEach((part) => {
    if (part.added || part.removed) {
      hasChanges = true;
    }
    // If a field was removed from the old schema, it's a breaking change for existing state
    if (part.removed) {
      hasBreakingChanges = true;
    }
  });

  return {
    hasChanges,
    hasBreakingChanges,
    changes: differences
  };
};