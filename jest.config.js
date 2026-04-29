export default {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {},
  collectCoverage: false,
  collectCoverageFrom: [
    'routes/**/*.js',
    'models.js',
    'server.js',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'text-summary'],
};
