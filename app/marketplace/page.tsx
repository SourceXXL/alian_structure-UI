'use client';

import { RecommendationCarousel } from '@/features/recommendations/components/RecommendationCarousel';

export default function Marketplace() {
  const agents = [
    {
      id: 1,
      name: 'DataBot Pro',
      description: 'Advanced data analysis and insights for complex datasets.',
      author: 'DataTeam',
      rating: 4.8,
      users: 1250,
      icon: '📊',
    },
    {
      id: 2,
      name: 'AutoWriter',
      description: 'AI-powered content generation for blogs and social media.',
      author: 'ContentStudio',
      rating: 4.6,
      users: 890,
      icon: '✍️',
    },
    {
      id: 3,
      name: 'CodeAssistant',
      description: 'Intelligent code generation and debugging in multiple languages.',
      author: 'DevTools',
      rating: 4.9,
      users: 2100,
      icon: '💻',
    },
    {
      id: 4,
      name: 'Sentinel AI',
      description: 'Enhanced security and threat detection for your infrastructure.',
      author: 'CyberShield',
      rating: 4.7,
      users: 540,
      icon: '🛡️',
    },
    {
      id: 5,
      name: 'Flux Designer',
      description: 'Generative art and UI design components from simple prompts.',
      author: 'CreativeFlow',
      rating: 4.5,
      users: 1670,
      icon: '🎨',
    },
    {
      id: 6,
      name: 'QuantX',
      description: 'Financial analysis and market trend prediction engine.',
      author: 'FinTechAI',
      rating: 4.9,
      users: 3200,
      icon: '📈',
    },
  ];

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-text">Agent Marketplace</h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl">
            Discover and deploy high-performance AI agents from our curated cosmic repository.
          </p>
        </header>

        {/* Personalized Recommendations */}
        <section className="mb-20">
          <RecommendationCarousel />
        </section>

        <section className="pt-20 border-t border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white glow-text">All Cosmic Agents</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-smooth">
                  Filters
                </button>
                <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-smooth bg-cosmic-dark outline-none">
                  <option>Popularity</option>
                  <option>Newest</option>
                  <option>Rating</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-6 md:p-8 rounded-2xl border border-cosmic-purple/20 hover:border-cosmic-blue/50 hover:shadow-xl hover:shadow-cosmic-blue/10 transition-all duration-300 nebula-bg cursor-pointer group flex flex-col h-full active:scale-[0.98] touch-manipulation"
                  >
                    <div className="text-4xl mb-6 bg-white/5 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-smooth">
                      {agent.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 glow-text group-hover:text-cosmic-cyan transition-smooth">
                        {agent.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed flex-grow">{agent.description}</p>
                    
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">by <span className="text-cosmic-purple font-medium">{agent.author}</span></span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-yellow-500">⭐ <span className="text-gray-300 font-semibold">{agent.rating}</span></span>
                            <span className="flex items-center gap-1 text-cosmic-cyan">👥 <span className="text-gray-300 font-semibold">{agent.users}</span></span>
                          </div>
                        </div>
                        <button className="w-full py-3 bg-cosmic-purple/20 hover:bg-cosmic-purple/40 border border-cosmic-purple/30 rounded-xl transition-smooth font-bold text-sm tracking-wide">
                            View Agent
                        </button>
                    </div>
                  </div>
              ))}
            </div>
        </section>
      </div>
    </main>
  );
}
