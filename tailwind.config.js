/** @type {import('tailwindcss').Config} */
module.exports = {
    //...
    content: ['./pages/**/*.{js,ts,jsx,tsx}'],
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- This configuration uses CommonJS.
    plugins: [require("daisyui")],
    daisyui: {
      themes: true
    }
  }
