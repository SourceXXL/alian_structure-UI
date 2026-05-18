import React, { useState } from 'react';
import { VersionMetadata } from '../types';

interface RollbackManagerProps {
  currentVersion: string;
  history: VersionMetadata[];
  onRollback: (targetVersion: string, contractId: string) => void;
}

export const RollbackManager: React.FC<RollbackManagerProps> = ({ currentVersion, history, onRollback }) => {
  const [selectedVersion, setSelectedVersion] = useState('');
  
  // Only allow rolling back to previous stable versions
  const stableVersions = history.filter(v => v.status === 'stable' && v.version !== currentVersion);

  const handleRollback = () => {
    const target = stableVersions.find(v => v.version === selectedVersion);
    if (target) {
      if (window.confirm(`🚨 WARNING: Are you sure you want to rollback to v${target.version}? This will update the active Soroban contract pointer.`)) {
        onRollback(target.version, target.contractId);
        setSelectedVersion('');
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-red-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(239,68,68,0.15)] text-white relative overflow-hidden">
      {/* Warning Stripes Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>

      <h2 className="text-2xl font-bold mb-2 text-red-400 flex items-center gap-2">
        <span>⚠️</span> Emergency Rollback
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        Instantly revert the active agent pointer to a previous stable contract version. Use only in case of critical failure in the current version (v{currentVersion}).
      </p>

      <div className="bg-slate-800/50 p-4 rounded-lg border border-red-900/50 flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Stable Target Version</label>
          <select 
            className="w-full bg-[#090b14] border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
          >
            <option value="" disabled>-- Select a version --</option>
            {stableVersions.map(v => (
              <option key={v.version} value={v.version}>v{v.version} (Deployed: {new Date(v.timestamp).toLocaleDateString()})</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={handleRollback}
          disabled={!selectedVersion}
          className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
        >
          EXECUTE ROLLBACK
        </button>
      </div>
    </div>
  );
};