module.exports = {
  preset: 'react-native',
  collectCoverageFrom: [
    'src/services/handler/services/{AppAndLoginServices,appLifecycleService,authService,networkService,networkServices,profileService,profileServices,RLNServices}.ts',
    'src/services/{analytics/index.ts,appreview/index.ts,twitter/index.ts}',
    'src/services/{rest/RestClient.ts,handler/runtimeApi.ts,handler/dataHandler.ts}',
    'src/services/{backup/backupUiBridge.ts,messaging/ChatService.ts}',
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
