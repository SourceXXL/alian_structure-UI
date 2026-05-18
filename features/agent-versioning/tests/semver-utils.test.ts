import { 
  isValidVersion, 
  compareVersions, 
  isBreakingChange, 
  validateUpgradePath 
} from '../lib/semver-utils';

describe('Semantic Versioning Utilities', () => {
  describe('isValidVersion', () => {
    it('should return true for valid semantic versions', () => {
      expect(isValidVersion('1.0.0')).toBe(true);
      expect(isValidVersion('0.1.0-beta')).toBe(true);
    });

    it('should return false for invalid versions', () => {
      expect(isValidVersion('1.0')).toBe(false);
      expect(isValidVersion('v1')).toBe(false);
      expect(isValidVersion('not-a-version')).toBe(false);
    });
  });

  describe('compareVersions', () => {
    it('should correctly evaluate version hierarchy', () => {
      expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
      expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
      expect(compareVersions('1.1.0', '1.1.0')).toBe(0);
    });
  });

  describe('isBreakingChange', () => {
    it('should detect major version bumps as breaking changes', () => {
      expect(isBreakingChange('1.0.0', '2.0.0')).toBe(true);
      expect(isBreakingChange('0.1.0', '1.0.0')).toBe(true);
    });

    it('should not flag minor or patch bumps as breaking changes', () => {
      expect(isBreakingChange('1.0.0', '1.1.0')).toBe(false);
      expect(isBreakingChange('1.0.0', '1.0.1')).toBe(false);
    });
  });

  describe('validateUpgradePath', () => {
    it('should reject downgrades or same-version deployments', () => {
      const result = validateUpgradePath('1.1.0', '1.0.0', false);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('strictly greater');
    });

    it('should allow major version bumps even with schema changes', () => {
      const result = validateUpgradePath('1.0.0', '2.0.0', true);
      expect(result.isValid).toBe(true);
    });

    it('should reject minor updates if they contain breaking schema changes', () => {
      const result = validateUpgradePath('1.0.0', '1.1.0', true);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('cannot contain breaking state schema changes');
    });

    it('should allow minor updates with safe schema changes', () => {
      const result = validateUpgradePath('1.0.0', '1.1.0', false);
      expect(result.isValid).toBe(true);
    });
  });
});