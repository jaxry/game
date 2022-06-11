const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        'color-border': colors.gray['500']
      },
      transitionDuration: {
        fast: '250ms',
        normal: '500ms',
        slow:'1000ms'
      }
    },
  },
  content: [
    "./index.html",
    "./src/ui/components/**/*.ts"
  ],
  plugins: [
    function ({ addVariant }) {
      addVariant('descendant', '& *');
      addVariant('child', '& > *');
    }
  ],
}
