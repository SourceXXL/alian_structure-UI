'use client';

import React, { useEffect, useState } from 'react';
import { RecommendedAgent } from '../types';
import { recommendationService } from '../services/recommendationService';
import { RecommendationCard } from './RecommendationCard';

export const RecommendationCarousel: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendedAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      const data = await recommendationService.getRecommendations();
      setRecommendations(data);
      setLoading(false);
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-12 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-[450px] bg-white/5 rounded-2xl border border-white/10" />
        ))}
      </div>
    );
  }

  return (
    <section className="py-20">
      <div className="flex justify-between items-end mb-12">
        <div className="space-y-4">
          <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cosmic-purple via-cosmic-blue to-cosmic-cyan">
             Personalized Directives
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
            Our AI engine has analyzed your recent activities to recommend the most optimal agents for your mission.
          </p>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-cosmic-cyan rounded-full animate-ping" />
            Live Engine Active
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        {/* Background glow for the whole section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cosmic-purple/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        {recommendations.map((agent) => (
          <RecommendationCard key={agent.id} agent={agent} />
        ))}
      </div>
    </section>
  );
};
