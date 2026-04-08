import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)"
      },
      colors: {
        // Background layers
        "bg": {
          0: "var(--bg-0)",
          1: "var(--bg-1)",
          2: "var(--bg-2)"
        },
        // Accent
        "accent": {
          violet: "var(--accent-violet)",
          cyan: "var(--accent-cyan)",
          pink: "var(--accent-pink)"
        },
        // Mood color scale (low to high)
        "mood": {
          low: "hsl(var(--mood-low) / <alpha-value>)",
          "low-mid": "hsl(var(--mood-low-mid) / <alpha-value>)",
          mid: "hsl(var(--mood-mid) / <alpha-value>)",
          "mid-high": "hsl(var(--mood-mid-high) / <alpha-value>)",
          high: "hsl(var(--mood-high) / <alpha-value>)"
        },
        // Glass surface colors (legacy compat)
        "surface": {
          10: "rgba(255, 255, 255, 0.10)",
          15: "rgba(255, 255, 255, 0.15)",
          20: "rgba(255, 255, 255, 0.20)"
        }
      },
      borderRadius: {
        card: "var(--radius-card)",
        pill: "var(--radius-pill)",
      },
      backdropBlur: {
        xl: "24px",
      }
    }
  },
  plugins: []
};

export default config;
