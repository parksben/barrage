const presets = [
  [
    '@babel/env',
    {
      targets: {
        browsers: ['> 0.25%', 'not dead'],
      },
      useBuiltIns: 'usage',
    },
  ],
];

module.exports = { presets };
