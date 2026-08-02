/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
      // P1-11: hex yerine CSS var() — index.css'teki :root ve .dark token'larını kullanır.
      // Böylece .dark class'ı değişince tüm utility'ler otomatik uyar (dark mode çalışır).
      colors: {
        paper:   'var(--color-paper)',
        'paper-2':'var(--color-paper-2)',
        'paper-3':'var(--color-paper-3)',
        ink:     'var(--color-ink)',
        'ink-2': 'var(--color-ink-2)',
        'ink-3': 'var(--color-ink-3)',
        accent:  'var(--color-accent)',
        'accent-2':'var(--color-accent-2)',
        'accent-bg':'var(--color-accent-bg)',
        earth:   'var(--color-earth)',
        'earth-bg':'var(--color-earth-bg)',
        sky:     'var(--color-sky)',
        'sky-bg': 'var(--color-sky-bg)',
        surface: 'var(--color-surface)',
        rule:    'var(--color-rule)',
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
