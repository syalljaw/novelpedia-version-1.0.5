/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: "#f8fafc", // Clean modern light Slate background
          card: "#ffffff", // Pure white sheet for beautiful content contrast
          border: "#e2e8f0", // Subtle Slate-200 borders
          borderActive: "#4f46e5", // Indigo-600 active border
          primary: "#6366f1", // Indigo Indigo-500 brand color
          accent: "#ca8a04", // Premium Gold / Amber for premium coins
          text: "#0f172a", // Deep slate-900 for modern readability
          muted: "#64748b", // Slate-500 subtitle context
          success: "#10b981", // Active Emerald-500
          caution: "#ef4444" // Coral Red-500 alert actions
        }
      },
      fontFamily: {
        mono: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        pixel: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "pixel-active": "0 0 0 2px #4f46e5",
        "pixel-pink": "0 0 0 2px #6366f1"
      },
      animation: {
        'scanline': 'scanline 6s linear infinite',
        'blink-caret': 'blink 1s step-end infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards'
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        blink: {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: '#ffd23f' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
