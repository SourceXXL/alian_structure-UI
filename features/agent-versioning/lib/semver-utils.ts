import semver from 'semver';

/**
 * Validates if a given string is a valid semantic version.
 */
export const isValidVersion = (version: string): boolean => {
  return semver.valid(version) !== null;
};

/**
 * Compares two versions. 
 * Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal.
 */
export const compareVersions = (v1: string, v2: string): 1 | 0 | -1 => {
  return semver.compare(v1, v2);
};

/**
 * Determines if an update from oldVersion to newVersion constitutes a breaking change.
 * In SemVer, a major version bump (e.g., 1.x.x to 2.x.x) is a breaking change.
 * The issue requirements state we must prevent breaking changes in minor updates.
 */
export const isBreakingChange = (oldVersion: string, newVersion: string): boolean => {
  if (!isValidVersion(oldVersion) || !isValidVersion(newVersion)) {
    throw new Error("Invalid version string provided.");
  }

  // If the major version is increased, it is a breaking change
  const oldMajor = semver.major(oldVersion);
  const newMajor = semver.major(newVersion);

  return newMajor > oldMajor;
};

/**
 * Checks if a proposed upgrade is allowed based on the strict rule:
 * "Prevent breaking changes in minor version updates".
 * * @param currentVersion The currently deployed version
 * @param proposedVersion The version attempting to be deployed
 * @param hasBreakingSchemaChanges Boolean indicating if the contract state changed drastically
 */
export const validateUpgradePath = (
  currentVersion: string, 
  proposedVersion: string, 
  hasBreakingSchemaChanges: boolean
): { isValid: boolean; reason?: string } => {
  if (compareVersions(proposedVersion, currentVersion) <= 0) {
    return { isValid: false, reason: "Proposed version must be strictly greater than current version." };
  }

  const isMajorBump = isBreakingChange(currentVersion, proposedVersion);

  if (!isMajorBump && hasBreakingSchemaChanges) {
    return { 
      isValid: false, 
      reason: "Minor/Patch version updates cannot contain breaking state schema changes." 
    };
  }

  return { isValid: true };
};