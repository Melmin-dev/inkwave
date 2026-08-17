/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#fdf3f7",
          100: "#fbe4ee",
          200: "#f6c9dd",
          300: "#efa0c1",
          400: "#e567a0",
          500: "#d63e82",
          600: "#bc2569",
          700: "#9b1a56",
          800: "#7f184a",
          900: "#6c1841",
        },
      },
      fontFamily: {
        serif: ["Georgia", "'Times New Roman'", "serif"],
      },
    },
  },
  plugins: [],
};
