import React, { useState } from 'react';
import { UpgradeProposal } from '../types';

interface UpgradeSchedulerProps {
  proposals: UpgradeProposal[];
  onVote: (proposalId: string, support: boolean) => void;
  onProposeNew: (targetVersion: string, scheduledTime: number) => void;
}

export const UpgradeScheduler: React.FC<UpgradeSchedulerProps> = ({ proposals, onVote, onProposeNew }) => {
  const [newVersion, setNewVersion] = useState('');
  const [scheduledDays, setScheduledDays] = useState(3);

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersion) return;
    const scheduledTime = Date.now() + scheduledDays * 24 * 60 * 60 * 1000;
    onProposeNew(newVersion, scheduledTime);
    setNewVersion('');
  };

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(99,102,241,0.2)] text-white">
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Upgrade Governance
      </h2>

      {/* Propose New Upgrade Form */}
      <form onSubmit={handlePropose} className="mb-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-blue-200 mb-4">Propose Upgrade</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Target Version (e.g. 2.0.0)</label>
            <input 
              type="text" 
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              className="w-full bg-[#090b14] border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="x.y.z"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm text-slate-400 mb-1">Delay (Days)</label>
            <input 
              type="number" 
              min="1"
              value={scheduledDays}
              onChange={(e) => setScheduledDays(Number(e.target.value))}
              className="w-full bg-[#090b14] border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-medium shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-colors">
            Propose
          </button>
        </div>
      </form>

      {/* Pending Proposals List */}
      <h3 className="text-lg font-semibold text-blue-200 mb-4">Pending Proposals</h3>
      <div className="space-y-4">
        {proposals.filter(p => p.status === 'pending').length === 0 ? (
          <p className="text-slate-400 italic">No active upgrade proposals.</p>
        ) : (
          proposals.filter(p => p.status === 'pending').map(proposal => {
            const totalVotes = proposal.votesFor + proposal.votesAgainst;
            const approvalPercentage = totalVotes === 0 ? 0 : (proposal.votesFor / totalVotes) * 100;

            return (
              <div key={proposal.proposalId} className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg text-white">Upgrade to v{proposal.targetVersion}</span>
                  <span className="text-sm text-slate-400">
                    Executes: {new Date(proposal.scheduledExecutionTime).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Voting Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-2.5 mb-2 mt-4">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full" style={{ width: `${approvalPercentage}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-4">
                  <span>{proposal.votesFor} For</span>
                  <span>{proposal.votesAgainst} Against</span>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => onVote(proposal.proposalId, true)} className="flex-1 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded transition-colors">
                    Vote For
                  </button>
                  <button onClick={() => onVote(proposal.proposalId, false)} className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded transition-colors">
                    Vote Against
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};