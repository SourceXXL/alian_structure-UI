module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          dark: 'rgb(var(--color-cosmic-dark) / <alpha-value>)',
          darker: 'rgb(var(--color-cosmic-darker) / <alpha-value>)',
          purple: 'rgb(var(--color-cosmic-purple) / <alpha-value>)',
          blue: 'rgb(var(--color-cosmic-blue) / <alpha-value>)',
          cyan: 'rgb(var(--color-cosmic-cyan) / <alpha-value>)',
          nebula: 'rgb(var(--color-cosmic-nebula) / <alpha-value>)',
        },
      },
      animation: {
        twinkle: 'twinkle 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      screens: {
        xs: '0px',
        sm: '600px',
        md: '900px',
        lg: '1200px',
        xl: '1536px',
      },
    },
  },
  plugins: [],
};
