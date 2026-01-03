/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // enable dark mode via 'class'
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // scan all your React files
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '0.625rem', // matches --radius
      },
      colors: {
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        card: 'rgb(var(--card))',
        'card-foreground': 'rgb(var(--card-foreground))',
        primary: 'rgb(var(--primary))',
        'primary-foreground': 'rgb(var(--primary-foreground))',
        secondary: 'rgb(var(--secondary))',
        'secondary-foreground': 'rgb(var(--secondary-foreground))',
        muted: 'rgb(var(--muted))',
        'muted-foreground': 'rgb(var(--muted-foreground))',
        accent: 'rgb(var(--accent))',
        'accent-foreground': 'rgb(var(--accent-foreground))',
        destructive: 'rgb(var(--destructive))',
        'destructive-foreground': 'rgb(var(--destructive-foreground))',
        border: 'rgb(var(--border))',
        input: 'rgb(var(--input))',
        ring: 'rgb(var(--ring))',
        sidebar: 'rgb(var(--sidebar))',
        'sidebar-foreground': 'rgb(var(--sidebar-foreground))',
        'sidebar-primary': 'rgb(var(--sidebar-primary))',
        'sidebar-primary-foreground': 'rgb(var(--sidebar-primary-foreground))',
        'sidebar-accent': 'rgb(var(--sidebar-accent))',
        'sidebar-accent-foreground': 'rgb(var(--sidebar-accent-foreground))',
        'sidebar-border': 'rgb(var(--sidebar-border))',
        'sidebar-ring': 'rgb(var(--sidebar-ring))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { 'background-position': '-1000px 0' },
          '100%': { 'background-position': '1000px 0' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
