'use client';

import React from 'react';
import { RecommendedAgent } from '../types';
import { FeedbackButton } from './FeedbackButton';

interface RecommendationCardProps {
  agent: RecommendedAgent;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ agent }) => {
  return (
    <div className="relative group p-1 transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02]">
      {/* Animated gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-cosmic-purple/40 via-cosmic-blue/40 to-cosmic-cyan/40 animate-pulse-slow blur-[2px]" />
      
      <div className="relative bg-[#0d122b] p-6 rounded-2xl border border-white/5 backdrop-blur-3xl h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cosmic-purple to-cosmic-blue rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-cosmic-purple/20">
              🚀
            </div>
            <span className="px-3 py-1 bg-cosmic-purple/20 border border-cosmic-purple/30 text-cosmic-purple text-[10px] font-bold uppercase tracking-wider rounded-full">
              Recommended for you
            </span>
          </div>

          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
            {agent.name}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {agent.description}
          </p>

          <div className="p-4 bg-cosmic-blue/5 border-l-2 border-cosmic-cyan rounded-r-lg mb-6 group-hover:bg-cosmic-blue/10 transition-colors">
            <h4 className="text-xs font-bold text-cosmic-cyan mb-2 flex items-center gap-1 uppercase tracking-tighter">
              <span className="text-sm">⭐</span> Personal Insight
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed italic">
              &quot;{agent.explanation}&quot;
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Influencing Factors
            </h4>
            <div className="flex flex-wrap gap-2">
              {agent.topFeatures.map((feature, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] text-gray-300 hover:border-cosmic-cyan/40 hover:text-cosmic-cyan transition-colors"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  ⭐ <span className="text-white font-semibold">{agent.rating}</span>
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  👤 <span className="text-white font-semibold">{agent.users}</span>
                </span>
              </div>
          </div>
          
          <button className="w-full py-2.5 bg-gradient-to-r from-cosmic-purple to-cosmic-blue hover:from-cosmic-blue hover:to-cosmic-cyan text-white text-xs font-bold rounded-xl transition-all duration-500 shadow-lg hover:shadow-cosmic-cyan/20">
            Deploy Agent
          </button>
          
          <FeedbackButton agentId={agent.id} />
        </div>
      </div>
    </div>
  );
};
