/* Footer Component */

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-cosmic-purple/20 py-8 px-4 text-center text-gray-400">
      <div className="max-w-7xl mx-auto">
        <p className="mb-4">© 2025 stellAIverse. All rights reserved.</p>
        <div className="flex justify-center gap-6 text-sm">
          <a href="#" className="hover:text-cosmic-purple transition-smooth">Privacy</a>
          <a href="#" className="hover:text-cosmic-purple transition-smooth">Terms</a>
          <a href="#" className="hover:text-cosmic-purple transition-smooth">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
