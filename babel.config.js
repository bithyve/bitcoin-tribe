module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['optional-require'],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
};
