export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        slate: {
          950: '#030712',
        },
        primary: '#136dec',
      },
    },
  },
  plugins: [],
};
