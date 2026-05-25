import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        orange: {
          50: "#FFF4E8",
          100: "#FFE5C7",
          200: "#F8C58D",
          300: "#D99B45",
          400: "#A76E04",
          500: "#ED6F00",
          600: "#A76E04",
          700: "#823A00",
          800: "#6B2F00",
          900: "#4A2100",
          950: "#2F1500",
        },
        brand: {
          dark: "#823A00",
          primary: "#A76E04",
          accent: "#ED6F00",
        },
      },
    },
  },

  plugins: [],
};

export default config;
