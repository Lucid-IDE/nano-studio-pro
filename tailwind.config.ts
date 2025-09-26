import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        "input-border": "hsl(var(--input-border))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        "surface-elevated": "hsl(var(--surface-elevated))",
        panel: "hsl(var(--panel))",
        "panel-foreground": "hsl(var(--panel-foreground))",
        "canvas-bg": "hsl(var(--canvas-bg))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        camera: {
          accent: "hsl(var(--camera-accent))",
          metal: "hsl(var(--camera-metal))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        control: {
          DEFAULT: "hsl(var(--control-bg))",
          hover: "hsl(var(--control-hover))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        highlight: "hsl(var(--highlight))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        tool: {
          active: "hsl(var(--tool-active))",
          inactive: "hsl(var(--tool-inactive))",
        },
        selection: "hsl(var(--selection))",
        "grid-line": "hsl(var(--grid-line))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "gradient-ai": "var(--gradient-ai)",
        "gradient-camera": "var(--gradient-camera)", 
        "gradient-canvas": "var(--gradient-canvas)",
      },
      boxShadow: {
        "panel": "var(--shadow-panel)",
        "tool": "var(--shadow-tool)",
        "glow": "var(--shadow-glow)",
      },
      transitionProperty: {
        "smooth": "var(--transition-smooth)",
        "fast": "var(--transition-fast)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(var(--primary) / 0.4)",
          },
          "50%": { 
            boxShadow: "0 0 30px hsl(var(--primary) / 0.8), 0 0 40px hsl(var(--accent) / 0.4)",
          },
        },
        "tool-select": {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 hsl(var(--primary) / 0)" },
          "50%": { transform: "scale(1.1)", boxShadow: "0 0 20px hsl(var(--primary) / 0.6)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 10px hsl(var(--primary) / 0.4)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "tool-select": "tool-select 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
