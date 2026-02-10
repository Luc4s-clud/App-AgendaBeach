/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#F4E9D8',
        ocean: '#1B75BC',
        aqua: '#2EC4B6',
        slateText: '#1F2937'
      },
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'system', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 25px rgba(15, 23, 42, 0.08)'
      },
      borderRadius: {
        '2xl': '1rem'
      }
    }
  },
  plugins: []
};

