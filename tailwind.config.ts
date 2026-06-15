import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Y2K Primary Colors
        'y2k-black': '#0a0a0a',
        'y2k-pink': '#FF69B4',
        'y2k-cyan': '#00FFFF',
        'y2k-lime': '#39FF14',
        'y2k-purple': '#9400D3',
        'y2k-yellow': '#FFFF00',
        'y2k-orange': '#FF6600',
        // Chrome/Metallic
        'chrome': '#C0C0C0',
        'chrome-dark': '#808080',
        'chrome-light': '#E8E8E8',
        // Glass
        'glass': 'rgba(255, 255, 255, 0.15)',
        'glass-dark': 'rgba(0, 0, 0, 0.4)',
        'glass-pink': 'rgba(255, 105, 180, 0.2)',
        'glass-cyan': 'rgba(0, 255, 255, 0.2)',
        // Exhibition Rebuild Colors
        'exhibition-void': '#080808',
        'exhibition-gold': '#C9A84C',
        'exhibition-bone': '#F5F0E8',
        'exhibition-fog': 'rgba(245, 240, 232, 0.06)',
      },
      fontFamily: {
        // Artistic display font
        display: ['Syne', 'sans-serif'],
        // Clean modern sans-serif
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        // Editorial headings
        editorial: ['"Cormorant Garamond"', 'serif'],
        // Space Grotesk for mono/body elements
        mono: ['"Space Grotesk"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.8s ease-out',
        'fade-in': 'fadeIn 1s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(100px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};

export default config;
