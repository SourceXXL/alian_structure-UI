import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="relative flex flex-col items-center">
        <h1 className="text-[10rem] font-bold leading-none select-none glow-text opacity-10">
          404
        </h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <span className="text-5xl">🌌</span>
          <h2 className="text-3xl font-bold glow-text">Lost in Space</h2>
          <p className="text-gray-400 max-w-sm">
            This page has drifted beyond the event horizon. It may have been
            moved, deleted, or never existed.
          </p>
          <Link
            href="/"
            className="mt-4 px-6 py-3 rounded-lg bg-gradient-to-r from-cosmic-purple to-cosmic-blue font-semibold hover:shadow-lg hover:shadow-cosmic-purple/50 transition-smooth"
          >
            Return to Universe
          </Link>
        </div>
      </div>
    </main>
  );
}
