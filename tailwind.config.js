/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        connect: {
          // Surfaces — white + light blue tints
          bg: "#FFFFFF",
          "bg-alt": "#F0F7FF",
          "bg-soft": "#F8FBFE",
          "bg-tint": "#E0F2FE",
          // Borders — soft blue grays
          border: "#DCE7F3",
          "border-soft": "#EAF0F7",
          "border-strong": "#A5BBD3",
          // Text — softened navy-grays
          text: "#1A2B42",
          "text-secondary": "#5A7090",
          "text-disabled": "#A5BBD3",
          // Brand "navy" — now a saturated blue for legible white-on-dark
          navy: "#1E40AF",
          "navy-deep": "#1E3A8A",
          // Primary (kept the `teal` key name for back-compat) — light/sky blue
          teal: "#3B82F6",
          "teal-dark": "#2563EB",
          "teal-light": "#60A5FA",
          "teal-soft": "#DBEAFE",
          "teal-50": "#EFF6FF",
          // Sky accent
          sky: "#0EA5E9",
          "sky-soft": "#E0F2FE",
          // Link blue
          blue: "#0972D3",
          "blue-dark": "#033160",
          "blue-light": "#539FE5",
          "blue-soft": "#EFF6FD",
          // AWS orange accent
          orange: "#FF9900",
          "orange-soft": "#FFF4DC",
          // Purple accent (softer for the light theme)
          purple: "#6366F1",
          "purple-soft": "#EEF2FF",
          // Pink accent
          pink: "#EC4899",
          "pink-soft": "#FDF2F8",
          // Semantic
          success: "#0F8C53",
          "success-soft": "#E6F7EE",
          warning: "#B25900",
          "warning-soft": "#FFF4DC",
          error: "#D13212",
          "error-soft": "#FDE8E3",
        },
      },
      fontFamily: {
        sans: [
          "Amazon Ember",
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        "connect-panel":
          "0 16px 48px -12px rgba(30, 64, 175, 0.20), 0 2px 8px rgba(30, 64, 175, 0.08)",
        "connect-card":
          "0 1px 2px rgba(30, 64, 175, 0.04), 0 1px 3px rgba(30, 64, 175, 0.06)",
        "connect-card-hover":
          "0 4px 12px rgba(30, 64, 175, 0.08), 0 2px 4px rgba(30, 64, 175, 0.04)",
      },
      backgroundImage: {
        "connect-hero":
          "linear-gradient(135deg, #2563EB 0%, #60A5FA 55%, #93C5FD 100%)",
        "connect-hero-soft":
          "linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)",
      },
    },
  },
  plugins: [],
};
