module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@config': './config',
          '@screens': './src/screens',
          '@components': './src/components',
          '@engines': './src/engines',
          '@api': './src/api',
          '@stores': './src/stores',
          '@hooks': './src/hooks',
          '@navigation': './src/navigation',
          '@theme': './src/theme',
        },
      },
    ],
    'react-native-reanimated/plugin', // Must be last
  ],
};
