import React from 'react';
import { VersionMetadata } from '../types';

interface VersionHistoryProps {
  versions: VersionMetadata[];
  onSelectCompare: (version: string) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, onSelectCompare }) => {
  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(99,102,241,0.2)] text-white">
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Version History
      </h2>
      <div className="space-y-4">
        {versions.length === 0 ? (
          <p className="text-slate-400 italic">No versions found on the ledger.</p>
        ) : (
          versions.map((v) => (
            <div key={v.version} className="bg-slate-800/50 rounded-lg p-4 flex justify-between items-center border border-slate-700 hover:border-blue-500/50 transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg font-semibold text-blue-100">v{v.version}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase border ${
                    v.status === 'stable' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                    v.status === 'beta' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                    'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                    {v.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Deployed: {new Date(v.timestamp).toLocaleString()}</p>
                <p className="text-sm text-slate-300 mt-2 line-clamp-2">{v.changelog}</p>
              </div>
              <button 
                onClick={() => onSelectCompare(v.version)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors shadow-[0_0_10px_rgba(79,70,229,0.3)]"
              >
                Compare
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};