import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
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