module.exports = {
  preset: 'react-native',
  collectCoverageFrom: [
    'src/services/handler/services/{networkServices,profileServices,WalletServices,backupService,RgbWalletServices}.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 10,
      branches: 4,
      functions: 30,
      lines: 10,
    },
  },
  coverageReporters: ['text-summary', 'lcov'],
};
