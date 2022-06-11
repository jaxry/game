const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        'color-border': colors.gray['500'],
      }
    },
  },
  content: [
    "./index.html",
    "./src/ui/components/**/*.ts"
  ],
  plugins: [],
}
