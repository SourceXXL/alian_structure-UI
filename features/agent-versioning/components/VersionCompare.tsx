import React, { useMemo } from 'react';
import { ContractStateSchema } from '../types';
import { compareSchemas } from '../lib/diff-utils';

interface VersionCompareProps {
  oldVersion: string;
  newVersion: string;
  oldSchema: ContractStateSchema;
  newSchema: ContractStateSchema;
}

export const VersionCompare: React.FC<VersionCompareProps> = ({ 
  oldVersion, 
  newVersion, 
  oldSchema, 
  newSchema 
}) => {
  const { changes, hasBreakingChanges } = useMemo(() => {
    return compareSchemas(oldSchema, newSchema);
  }, [oldSchema, newSchema]);

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(99,102,241,0.2)] text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Schema Diff: v{oldVersion} → v{newVersion}
        </h2>
        {hasBreakingChanges && (
          <span className="px-3 py-1 bg-red-500/10 text-red-400 text-sm font-bold rounded-full border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
            ⚠️ Breaking Changes Detected
          </span>
        )}
      </div>

      <div className="bg-[#090b14] rounded-lg border border-slate-700 font-mono text-sm overflow-hidden">
        {changes.map((part, index) => {
          const colorClass = part.added ? 'bg-green-900/20 text-green-400' :
                             part.removed ? 'bg-red-900/20 text-red-400' :
                             'text-slate-400';
          
          const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
          const lines = part.value.split('\n').filter((line: string) => line.length > 0);

          return (
            <div key={index} className={colorClass}>
              {lines.map((line: string, i: number) => (
                <div key={i} className="px-4 py-1.5 border-b border-slate-800/50 last:border-0 whitespace-pre">
                  <span className="opacity-50 select-none mr-4">{prefix}</span>
                  {line}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};