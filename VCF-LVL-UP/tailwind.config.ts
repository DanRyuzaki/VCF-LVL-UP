import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/dashboards/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:       "#0A0A0A",
          bg2:      "#121212",
          bg3:      "#1A1A1A",
          bg4:      "#232323",
          border:   "#2E2E2E",
          red:      "#FF4655",
          red2:     "#E53E4D",
          teal:     "#00F5D4",
          purple:   "#8B5CF6",
          text:     "#FFFFFF",
          text2:    "#B8B8B8",
          text3:    "#808080",
        },
      },
      fontFamily: {
        head: ["Rajdhani", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
