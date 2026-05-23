/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        connect: {
          // Surfaces
          bg: "#FFFFFF",
          "bg-alt": "#F2F3F3",
          "bg-soft": "#FAFAFA",
          // Borders
          border: "#D5DBDB",
          "border-strong": "#9BA7B6",
          // Text
          text: "#16191F",
          "text-secondary": "#5F6B7A",
          "text-disabled": "#9BA7B6",
          // Brand navy (header / dark surfaces)
          navy: "#16191F",
          "navy-deep": "#0F1B2D",
          // Brand teal (primary actions, Connect green)
          teal: "#067F68",
          "teal-dark": "#04604F",
          "teal-soft": "#E6F4F1",
          // Link blue
          blue: "#0972D3",
          "blue-dark": "#033160",
          "blue-soft": "#F2F8FD",
          // AWS orange (accents)
          orange: "#FF9900",
          // Semantic
          success: "#037F0C",
          "success-soft": "#EFFAF2",
          warning: "#B25900",
          "warning-soft": "#FCF4E5",
          error: "#D13212",
          "error-soft": "#FDF3F1",
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
          "0 16px 48px -12px rgba(15, 27, 45, 0.28), 0 2px 8px rgba(15, 27, 45, 0.08)",
      },
    },
  },
  plugins: [],
}
