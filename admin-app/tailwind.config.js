/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BulSU Red - Primary Color
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Dark Gold - Accent Color
        gold: {
          50: '#fdfbf7',
          100: '#faf3e6',
          200: '#f5e6c8',
          300: '#e9d5a1',
          400: '#d4b872',
          500: '#b8962e',
          600: '#9a7b1f',
          700: '#7a6119',
          800: '#5c4912',
          900: '#3d300c',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fdfbf7',
          100: '#faf3e6',
          500: '#b8962e',
          600: '#9a7b1f',
        }
      }
    },
  },
  plugins: [],
}
