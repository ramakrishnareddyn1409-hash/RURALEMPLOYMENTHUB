/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Government Emerald Forest Theme
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        // Government Sky Blue Theme
        sky: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        // Government Saffron / Orange Accents
        saffron: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        // Warm Paper / Gov Neutrals
        cream: {
          50: "#fcfaf5",
          100: "#f3ede0",
          200: "#e8e0cc",
          300: "#ded2b8",
        },
        gov: {
          dark: "#0a1f0d",
          cardDark: "#102a14",
          borderDark: "#1c4323",
          surfaceDark: "#15351a",
          accentDark: "#22c55e",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        heading: ["'Outfit'", "'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "Menlo", "monospace"],
      },
      backgroundImage: {
        "gradient-gov": "linear-gradient(135deg, #047857 0%, #0284c7 100%)",
        "gradient-emerald": "linear-gradient(135deg, #064e3b 0%, #047857 50%, #0284c7 100%)",
        "gradient-saffron": "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
        "gradient-dark-gov": "linear-gradient(135deg, #052e16 0%, #082f49 100%)",
      },
      boxShadow: {
        gov: "0 4px 20px -2px rgba(5, 150, 105, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.06)",
        "gov-lg": "0 10px 30px -4px rgba(5, 150, 105, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.08)",
        "gov-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s infinite linear",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
