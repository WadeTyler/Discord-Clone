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
        primaryLight: '#383A40',
        secondary: '#2B2D31',
        tertiary: '#1E2022',
        accent: '#d3d3d3',
        accentDark: '#B5BAC1',
        accentBlue: '#5865F2',
        accentBlueDark: '#4752C4',
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
}