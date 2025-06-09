/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // Adjust if necessary
  ],
  theme: {
    extend: {
      colors: {
        text:      '#20436F',
        bg:        '#DDEAF8',
        primary:   '#E67300',
        secondary: '#186DCD',
        accent:    '#FBEE00',
      },
      screens: {
        sm:'500px',
        sss:'470px',
        ss:'440px',
        es: '390px',
        ees: '345px',
      },
      animation: {
        roll: 'roll 2s ease-in-out', 
        'caret-blink': 'caret-blink 1.2s ease-out infinite', // Define the roll animation
      },
      keyframes: {
        roll: {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '100%': { transform: 'translateY(-200px) rotate(360deg)' }, // You can adjust these values for a better rolling effect
        },
        'caret-blink': {
          '0%, 70%, 100%': { opacity: '1' },
          '20%, 50%': { opacity: '0' },
        },
      },
    },
  },
    corePlugins: {
    backdropBlur: true,   // turn on the built-in backdrop‐blur utilities
  },
  plugins: [],
};
