import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0F172A",
        violet: {
          DEFAULT: "#7C3AED",
          600: "#7C3AED",
          500: "#8B5CF6",
          400: "#A78BFA",
        },
        crimson: "#DC2626",
        amber: {
          DEFAULT: "#D97706",
          600: "#D97706",
        },
        emerald: {
          DEFAULT: "#059669",
          600: "#059669",
        },
        bg: "#0A0A0F",
        surface: "#12121A",
        "surface-2": "#1A1A27",
        text: "#F8FAFC",
        "text-muted": "#94A3B8",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "count-up": "countUp 1s ease-out forwards",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "border-spin": "borderSpin 3s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        borderSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "shimmer-gradient": "linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)",
        "hero-glow": "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "glow-violet": "0 0 20px rgba(124,58,237,0.4)",
        "glow-red": "0 0 20px rgba(220,38,38,0.4)",
        "glow-green": "0 0 20px rgba(5,150,105,0.4)",
        "glow-amber": "0 0 20px rgba(217,119,6,0.4)",
        "card": "0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
