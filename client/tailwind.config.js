/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#F50400",
          hover: "#DC0300",
          dark: "#B80200",
          light: "#FFF1F0",
          subtle: "rgba(245, 4, 0, 0.08)",
          ring: "rgba(245, 4, 0, 0.25)",
        },
        obsidian: {
          DEFAULT: "#0F172A",
          surface: "#1E293B",
          card: "#182234",
          border: "#334155",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)",
        elevated: "0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 4px 10px -4px rgba(0, 0, 0, 0.05)",
        glow: "0 0 25px -5px rgba(245, 4, 0, 0.35)",
        glowSm: "0 0 15px -3px rgba(245, 4, 0, 0.25)",
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
