const isCI = !!process.env.CI;

export default {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {},
  testPathIgnorePatterns: isCI
    ? ['/node_modules/', '\\.integration\\.test\\.js$']
    : ['/node_modules/'],
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
