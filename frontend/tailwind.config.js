/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1A56DB', light: '#3B82F6' },
        accent: '#06B6D4',
        surface: { DEFAULT: '#0F172A', card: '#1E293B', muted: '#334155' },
        deal: {
          text: '#F1F5F9',
          muted: '#94A3B8'
        }
      },
      fontFamily: {
        heading: ['Syne', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
