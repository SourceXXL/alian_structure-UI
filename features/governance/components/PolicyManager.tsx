'use client';

import React, { useState } from 'react';
import { Policy, quotaService } from '../../agent-telemetry/services/quotaService';

export const PolicyManager: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([
    { id: '1', name: 'Free Tier', quotaLimit: 1000, rateLimit: 2, description: 'Basic access for non-commercial use.' },
    { id: '2', name: 'Pro Tier', quotaLimit: 10000, rateLimit: 10, description: 'High-throughput access for production deployments.' },
    { id: '3', name: 'Enterprise Tier', quotaLimit: 100000, rateLimit: 50, description: 'Dedicated resources for enterprise scale.' },
  ]);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;

    const result = await quotaService.updatePolicy(editingPolicy);
    if (result) {
       setPolicies(prev => prev.map(p => p.id === editingPolicy.id ? editingPolicy : p));
       setEditingPolicy(null);
    }
  };

  return (
    <div className="py-12">
      <h2 className="text-3xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cosmic-purple to-cosmic-blue">
        Governance & Policy Management
      </h2>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Policy List */}
        <div className="lg:col-span-2 space-y-4">
          {policies.map((policy) => (
            <div 
              key={policy.id} 
              className="p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md flex justify-between items-center transition-all hover:border-cosmic-purple/30 group"
            >
              <div>
                <h4 className="text-xl font-bold text-white mb-1">{policy.name}</h4>
                <p className="text-xs text-gray-400 mb-3">{policy.description}</p>
                <div className="flex gap-4">
                  <span className="text-[10px] uppercase font-bold text-cosmic-cyan flex items-center gap-1">
                    <span className="text-sm">🎫</span> {policy.quotaLimit.toLocaleString()} Requests/Day
                  </span>
                  <span className="text-[10px] uppercase font-bold text-cosmic-purple flex items-center gap-1">
                    <span className="text-sm">⚡</span> {policy.rateLimit} Req/Sec
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setEditingPolicy({...policy})} 
                className="px-4 py-2 bg-white/10 hover:bg-cosmic-purple/30 border border-white/10 rounded-lg text-xs font-bold transition-smooth"
              >
                Edit Policy
              </button>
            </div>
          ))}
        </div>

        {/* Edit Form Card */}
        <div className="h-fit">
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0d122b] sticky top-24 shadow-2xl">
             <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-cosmic-cyan rounded-full" />
                {editingPolicy ? `Updating: ${editingPolicy.name}` : 'Select a Policy to Manage'}
             </h3>

             {editingPolicy ? (
               <form onSubmit={handleUpdate} className="space-y-6">
                 <div>
                   <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Daily Quota Limit</label>
                   <input 
                     type="number" 
                     className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cosmic-cyan transition-colors"
                     value={editingPolicy.quotaLimit}
                     onChange={(e) => setEditingPolicy({...editingPolicy, quotaLimit: Number(e.target.value)})}
                   />
                 </div>
                 <div>
                    <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">Rate Limit (req/s)</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cosmic-cyan transition-colors"
                      value={editingPolicy.rateLimit}
                      onChange={(e) => setEditingPolicy({...editingPolicy, rateLimit: Number(e.target.value)})}
                    />
                 </div>
                 <div className="pt-4 flex gap-3">
                   <button 
                     type="submit" 
                     className="flex-1 py-3 bg-cosmic-purple hover:bg-cosmic-blue text-white rounded-xl text-xs font-bold transition-smooth shadow-lg shadow-cosmic-purple/20"
                   >
                     Apply Changes
                   </button>
                   <button 
                     type="button" 
                     onClick={() => setEditingPolicy(null)}
                     className="px-4 py-3 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl text-xs font-bold transition-smooth"
                   >
                     Cancel
                   </button>
                 </div>
               </form>
             ) : (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-xl">
                    <p className="text-xs text-gray-500 px-8">
                        The planetary governance system is awaiting instructions. Select a policy to recalibrate its cosmic limits.
                    </p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
