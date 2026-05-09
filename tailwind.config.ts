import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dk: "#1A1A1A",
        dk2: "#242424",
        dk3: "#2E2E2E",
        dk4: "#383838",
        coral: "#F45B69",
        gold: "#D4956A",
        plum: "#C87E9A",
        txt: "#F0F0F0",
        txt2: "#A0A0A0",
        txt3: "#6A6A6A",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
