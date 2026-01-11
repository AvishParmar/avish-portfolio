/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        muted: "#475569",
        border: "#E2E8F0",
        accent: "#2563EB",

        // dark mode equivalents
        darkbg: "#0B1220",
        darkink: "#E5E7EB",
        darkmuted: "#9CA3AF",
        darkborder: "#1F2937",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
