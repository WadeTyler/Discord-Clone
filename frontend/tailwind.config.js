/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#313338',
        secondary: '#2B2D31',
        tertiary: '#1E2022',
        accent: '#d3d3d3',
      }
    },
  },
  plugins: [],
}