const presets = [
  [
    '@babel/env',
    {
      targets: {
        browsers: ['> 0.25%', 'not dead'],
      },
      useBuiltIns: 'usage',
      corejs: 3,
    },
  ],
];

module.exports = { presets };
