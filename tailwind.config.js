module.exports = {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    gridTemplateColumns: {
      'auto-fill-6': 'repeat(auto-fill, minmax(24px, 1fr))',
      'auto-fill-12': 'repeat(auto-fill, minmax(48px, 1fr))',
      'auto-fill-24': 'repeat(auto-fill, minmax(96px, 1fr))',
      'auto-fill-36': 'repeat(auto-fill, minmax(144px, 1fr))',
      'auto-fill-48': 'repeat(auto-fill, minmax(192px, 1fr))',
      'auto-fill-72': 'repeat(auto-fill, minmax(288px, 1fr))',
    },
    extend: {},
  },
  plugins: [],
};
