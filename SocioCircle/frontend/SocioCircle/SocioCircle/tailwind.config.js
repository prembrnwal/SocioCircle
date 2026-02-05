/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0095F6',
        background: {
          light: '#FFFFFF',
          dark: '#000000',
        },
        surface: {
          light: '#FAFAFA',
          dark: '#121212',
        },
        text: {
          primary: {
            light: '#262626',
            dark: '#FFFFFF',
          },
          secondary: {
            light: '#8E8E93',
            dark: '#A8A8A8',
          },
        },
        border: {
          light: '#DBDBDB',
          dark: '#262626',
        },
        error: '#ED4956',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
      },
      borderRadius: {
        'lg': '8px',
        'xl': '12px',
      },
    },
  },
  plugins: [],
}
