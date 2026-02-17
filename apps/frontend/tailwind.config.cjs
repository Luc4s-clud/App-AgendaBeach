/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta baseada na logo da Beach Arena
        sand: '#F4E9D8', // fundo neutro (areia clara)
        ocean: '#0057FF', // azul de fundo / mar
        aqua: '#22C55E', // verde da palmeira
        sunset: '#FF7A1A', // laranja do sol/ondas
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

