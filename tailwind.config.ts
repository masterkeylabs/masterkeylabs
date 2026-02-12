import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: {
          DEFAULT: "#000000",
          light: "#0A0A0A",
          dark: "#000000",
        },
        silver: {
          DEFAULT: "#A1A1AA",
          light: "#E4E4E7",
        },
        chrome: {
          DEFAULT: "#F4F4F5",
        }
      },
      backgroundImage: {
        "gradient-radial-blue": "radial-gradient(circle at center, rgba(0, 102, 255, 0.15) 0%, transparent 70%)",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "orbit": "orbit 20s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
