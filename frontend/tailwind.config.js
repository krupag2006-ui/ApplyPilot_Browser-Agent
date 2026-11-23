/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F2F6F4',
          100: '#E1ECE6',
          200: '#C2D8CD',
          300: '#94BCAB',
          400: '#5F9981',
          500: '#3D7962',
          600: '#2C5F4C',
          700: '#234C3D',
          800: '#1C3A2F',
          900: '#152C24',
          950: '#0B1713',
        },
        terracotta: {
          50: '#FDF7F5',
          100: '#FAECE7',
          200: '#F5D7CE',
          300: '#ECB9AA',
          400: '#DE8E77',
          500: '#C86343',
          600: '#B44E2F',
          700: '#963E24',
          800: '#7B3521',
          900: '#662F20',
        },
        ivory: {
          50: '#FCFBF8',
          100: '#FAF6F0',
          200: '#F4EFEA',
          300: '#EAE2D7',
          400: '#DCD1C2',
          500: '#C8BAA6',
        },
        sand: {
          50: '#F9F8F6',
          100: '#F2EFE9',
          200: '#E6E0D5',
          300: '#D5CBBF',
        },
        charcoal: {
          50: '#F6F6F6',
          100: '#E7E7E7',
          200: '#D1D1D1',
          300: '#B0B0B0',
          400: '#888888',
          500: '#6D6D6D',
          600: '#575757',
          700: '#474747',
          800: '#353839',
          900: '#212529',
          950: '#16181A',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(21, 44, 36, 0.04), 0 1px 3px rgba(21, 44, 36, 0.02)',
        'card': '0 4px 20px -2px rgba(21, 44, 36, 0.05), 0 2px 6px -1px rgba(21, 44, 36, 0.03)',
        'lifted': '0 12px 32px -4px rgba(21, 44, 36, 0.08), 0 4px 12px -2px rgba(21, 44, 36, 0.04)',
      }
    },
  },
  plugins: [],
}
