/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "priority-low": "#46F7B7",
        "priority-medium": "#F5EB88",
        "priority-high": "#FFA775",
        "priority-highest": "#F27F77",
      },
    },
  },
  plugins: [],
};
