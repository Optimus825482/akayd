/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Roboto Slab', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper:   '#f7f6f3',
        'paper-2':'#efede8',
        'paper-3':'#e0ded7',
        ink:     '#141a12',
        'ink-2': '#2d3528',
        'ink-3': '#5a6552',
        accent:  '#1a6532',
        'accent-2':'#228b3a',
        'accent-bg':'#e6f4ea',
        earth:   '#8b6508',
        'earth-bg':'#fdf3e0',
        sky:     '#1d4ed8',
        'sky-bg': '#e8f0fe',
        surface: '#ffffff',
        rule:    '#d4d2cc',
      },
      borderRadius: { 'card': '16px', 'btn': '10px' },
      boxShadow: {
        'card': '0 4px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04)',
        'lg': '0 8px 30px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)',
      },
    },
    container: { center: true, padding: '1.5rem' },
  },
  plugins: [],
}
