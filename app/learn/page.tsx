'use client';

export default function Learn() {
  const tutorials = [
    {
      id: 1,
      title: 'Getting Started with AI Agents',
      difficulty: 'Beginner',
      duration: '15 min',
      description: 'Learn the basics of AI agents and how they work',
    },
    {
      id: 2,
      title: 'Building Smarter Agents',
      difficulty: 'Intermediate',
      duration: '45 min',
      description: 'Advanced techniques for creating more intelligent agents',
    },
    {
      id: 3,
      title: 'Agent Optimization & Deployment',
      difficulty: 'Advanced',
      duration: '1 hour',
      description: 'Deploy and optimize agents for production use',
    },
  ];

  return (
    <main className="pt-20 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 glow-text">Learning Center</h1>
        <p className="text-gray-300 text-lg mb-12">Master the art of building intelligent AI agents</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className="p-6 rounded-lg border border-cosmic-purple/30 hover:border-cosmic-cyan/60 hover:shadow-lg hover:shadow-cosmic-cyan/20 transition-smooth nebula-bg cursor-pointer group"
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2 glow-text group-hover:text-cosmic-cyan transition-smooth">
                {tutorial.title}
              </h3>
              <p className="text-gray-300 text-sm mb-4">{tutorial.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span className={`px-3 py-1 rounded-full ${
                  tutorial.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                  tutorial.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {tutorial.difficulty}
                </span>
                <span>⏱️ {tutorial.duration}</span>
              </div>
              <button className="w-full mt-4 py-2 bg-cosmic-cyan/30 hover:bg-cosmic-cyan/60 rounded transition-smooth font-semibold">
                Start Learning
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
