/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f9f9ff",
        surface: "#f9f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f3fd",
        "surface-container": "#ecedf7",
        "surface-container-high": "#e6e8f2",
        "surface-container-highest": "#e0e2ec",
        "on-surface": "#191c23",
        "on-surface-variant": "#414754",
        "outline-variant": "#c1c6d6",
        outline: "#727785",
        primary: "#005bbf",
        "primary-container": "#1a73e8",
        "primary-fixed": "#d8e2ff",
        "on-primary": "#ffffff",
        "on-primary-fixed-variant": "#004493",
        secondary: "#5c5f60",
        "secondary-container": "#e1e3e4",
        tertiary: "#9e4300",
        "tertiary-container": "#c55500",
        "tertiary-fixed": "#ffdbcb",
        error: "#ba1a1a",
        "error-container": "#ffdad6"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        card: "0 4px 12px rgba(15, 23, 42, 0.05)"
      },
      borderRadius: {
        xl: "0.75rem"
      }
    }
  },
  plugins: []
};
