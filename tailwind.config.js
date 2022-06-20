module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    screens: {
      // Each study is 512 pixels wide, lg is > 1.5 studies wide
      // so that at least 1 1/2 studies are visible on the horizontal scroll
      lg: "768px",
    },
    extend: {
      spacing: {
        "1c": "512px",
      },
    },
  },
  plugins: [
    // ...
    require('@tailwindcss/forms'),
  ],
};
