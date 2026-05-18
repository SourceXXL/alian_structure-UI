'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20 px-4 text-center relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-cosmic-purple/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 relative">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold glow-text animate-float leading-tight px-2">
            Welcome to stellAIverse
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
            Discover, create, and interact with AI agents in a beautiful cosmic universe.
            Build intelligent automation with an immersive experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 md:pt-8 px-6">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cosmic-purple to-cosmic-blue rounded-xl font-semibold hover:shadow-lg hover:shadow-cosmic-purple/50 transition-smooth glow-border text-center active:scale-95 touch-manipulation"
            >
              Explore Marketplace
            </Link>
            <Link
              href="/create"
              className="w-full sm:w-auto px-8 py-3.5 border-2 border-cosmic-purple rounded-xl font-semibold hover:bg-cosmic-purple/10 transition-smooth text-center active:scale-95 touch-manipulation"
            >
              Create Your Agent
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 glow-text">
            Key Features
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 md:p-8 rounded-2xl border border-cosmic-purple/20 hover:border-cosmic-purple/50 hover:shadow-lg hover:shadow-cosmic-purple/10 transition-smooth nebula-bg group"
              >
                <div className="text-3xl md:text-4xl mb-6 bg-white/5 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl group-hover:scale-110 transition-smooth">
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 glow-text group-hover:text-cosmic-purple transition-smooth">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-cosmic-purple/5 -z-10" />
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 glow-text px-4">Ready to Begin?</h2>
          <p className="text-base md:text-lg text-gray-300 mb-10 px-6 max-w-xl mx-auto">
            Join thousands of users creating and deploying intelligent AI agents in the most advanced marketplace.
          </p>
          <Link
            href="/create"
            className="inline-block px-10 py-4 bg-gradient-to-r from-cosmic-nebula to-cosmic-purple rounded-xl font-semibold hover:shadow-lg hover:shadow-cosmic-nebula/50 transition-smooth active:scale-95 touch-manipulation"
          >
            Start Creating Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cosmic-purple/10 py-10 px-4 text-center text-gray-500 text-sm">
        <p>© 2025 stellAIverse. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6">
          <Link href="#" className="hover:text-cosmic-purple transition-smooth">Terms</Link>
          <Link href="#" className="hover:text-cosmic-purple transition-smooth">Privacy</Link>
          <Link href="#" className="hover:text-cosmic-purple transition-smooth">Support</Link>
        </div>
      </footer>
    </main>
  );
}

const features = [
  {
    icon: '🧙',
    title: 'Agent Creation Wizard',
    description: 'Describe your agent\'s behavior and automatically generate basic contracts and metadata.',
  },
  {
    icon: '🌌',
    title: 'Galaxy Marketplace',
    description: 'Browse and discover agents visualized as stars and planets in an immersive interface.',
  },
  {
    icon: '💬',
    title: 'Agent Chat Interface',
    description: 'Interact with your AI agents in real-time through an intuitive chat interface.',
  },
  {
    icon: '📊',
    title: 'Agent Portfolio',
    description: 'Track your owned agents and view detailed performance statistics.',
  },
  {
    icon: '🎓',
    title: 'Educational Mode',
    description: 'Learn best practices and tutorials for building smarter agents.',
  },
  {
    icon: '✨',
    title: 'Cosmic UI Theme',
    description: 'Stunning dark space aesthetic with glowing effects and animated constellations.',
  },
];
